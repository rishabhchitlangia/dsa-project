import { prisma } from "./db";
import { getOpenStatus } from "./hours";
import { haversineKm, boundingBox } from "./geo";
import { findArea } from "./areas";
import {
  DEFAULT_RESULT_LIMIT,
  MAX_RESULT_LIMIT,
  SEARCH_RADII_KM,
} from "./constants";
import type { CategoryValue } from "./validation";
import type { ShopSummary, ShopDetail, ReviewDTO } from "@/types/shop";

type ShopRow = {
  id: string;
  slug: string;
  name: string;
  address: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hoursWeekday: string;
  hoursWeekend: string;
  category: string;
  verifiedToday: boolean;
  verifiedAt: Date | null;
};

/**
 * Rating aggregates for a set of shops, in one query. Computed rather than
 * denormalised onto Shop — correct by construction, and at a few hundred
 * shops the cost is nil.
 */
async function ratingsFor(shopIds: string[]) {
  if (shopIds.length === 0) return new Map<string, { avg: number; count: number }>();
  const grouped = await prisma.review.groupBy({
    by: ["shopId"],
    where: { shopId: { in: shopIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    grouped.map((g) => [
      g.shopId,
      { avg: g._avg.rating ?? 0, count: g._count._all },
    ]),
  );
}

function toSummary(
  row: ShopRow,
  rating: { avg: number; count: number } | undefined,
  distanceKm?: number,
): ShopSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    address: row.address,
    area: row.area,
    pincode: row.pincode,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    hoursWeekday: row.hoursWeekday,
    hoursWeekend: row.hoursWeekend,
    category: row.category as CategoryValue,
    verifiedToday: row.verifiedToday,
    verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
    averageRating:
      rating && rating.count > 0 ? Math.round(rating.avg * 10) / 10 : null,
    reviewCount: rating?.count ?? 0,
    ...(distanceKm === undefined ? {} : { distanceKm }),
    status: getOpenStatus(row),
  };
}

export type SearchParams = {
  lat?: number;
  lng?: number;
  q?: string;
  category?: CategoryValue;
  limit?: number;
};

/**
 * Shop search. A free-text query is resolved against the local Mumbai area
 * dataset first; if it names an area we search outward from its centroid,
 * otherwise we fall back to matching shop name/address/area text.
 */
export async function searchShops(params: SearchParams): Promise<{
  shops: ShopSummary[];
  center: [number, number] | null;
  resolvedArea: string | null;
}> {
  const limit = Math.min(params.limit ?? DEFAULT_RESULT_LIMIT, MAX_RESULT_LIMIT);
  const categoryFilter = params.category ? { category: params.category } : {};

  let center: [number, number] | null = null;
  let resolvedArea: string | null = null;

  if (typeof params.lat === "number" && typeof params.lng === "number") {
    center = [params.lat, params.lng];
  } else if (params.q) {
    const area = findArea(params.q);
    if (area) {
      center = [area.lat, area.lng];
      resolvedArea = area.name;
    }
  }

  // Proximity search: widen the radius until we have enough results, so a
  // quiet neighbourhood still returns something useful.
  if (center) {
    const [lat, lng] = center;
    for (const radiusKm of SEARCH_RADII_KM) {
      const box = boundingBox({ latitude: lat, longitude: lng }, radiusKm);
      const rows = (await prisma.shop.findMany({
        where: {
          ...categoryFilter,
          latitude: { gte: box.minLat, lte: box.maxLat },
          longitude: { gte: box.minLng, lte: box.maxLng },
        },
        take: MAX_RESULT_LIMIT,
      })) as ShopRow[];

      const withDistance = rows
        .map((row) => ({
          row,
          km: haversineKm(
            { latitude: lat, longitude: lng },
            { latitude: row.latitude, longitude: row.longitude },
          ),
        }))
        // The bounding box is a square; trim the corners to a true circle.
        .filter((r) => r.km <= radiusKm)
        .sort((a, b) => a.km - b.km)
        .slice(0, limit);

      const isLastRadius = radiusKm === SEARCH_RADII_KM[SEARCH_RADII_KM.length - 1];
      if (withDistance.length > 0 || isLastRadius) {
        const ratings = await ratingsFor(withDistance.map((r) => r.row.id));
        return {
          shops: withDistance.map((r) =>
            toSummary(r.row, ratings.get(r.row.id), r.km),
          ),
          center,
          resolvedArea,
        };
      }
    }
  }

  // Text search fallback — the query didn't name a known area.
  const where = params.q
    ? {
        ...categoryFilter,
        OR: [
          { name: { contains: params.q, mode: "insensitive" as const } },
          { area: { contains: params.q, mode: "insensitive" as const } },
          { address: { contains: params.q, mode: "insensitive" as const } },
          { pincode: { startsWith: params.q } },
        ],
      }
    : categoryFilter;

  const rows = (await prisma.shop.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: limit,
  })) as ShopRow[];

  const ratings = await ratingsFor(rows.map((r) => r.id));
  return {
    shops: rows.map((row) => toSummary(row, ratings.get(row.id))),
    center,
    resolvedArea,
  };
}

/** All shops in one curated section, best-rated first. */
export async function listByCategory(
  category: CategoryValue,
): Promise<ShopSummary[]> {
  const rows = (await prisma.shop.findMany({
    where: { category },
    orderBy: { name: "asc" },
  })) as ShopRow[];
  const ratings = await ratingsFor(rows.map((r) => r.id));
  const shops = rows.map((row) => toSummary(row, ratings.get(row.id)));

  return shops.sort((a, b) => {
    // Reviewed shops first, then by rating, then alphabetically.
    if ((b.reviewCount > 0 ? 1 : 0) !== (a.reviewCount > 0 ? 1 : 0)) {
      return (b.reviewCount > 0 ? 1 : 0) - (a.reviewCount > 0 ? 1 : 0);
    }
    if ((b.averageRating ?? 0) !== (a.averageRating ?? 0)) {
      return (b.averageRating ?? 0) - (a.averageRating ?? 0);
    }
    return a.name.localeCompare(b.name);
  });
}

function toReviewDTO(r: {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  insiderTip: string | null;
  helpfulCount: number;
  createdAt: Date;
}): ReviewDTO {
  return {
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    body: r.body,
    insiderTip: r.insiderTip,
    helpfulCount: r.helpfulCount,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getShopBySlug(slug: string): Promise<ShopDetail | null> {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      // Newest first, as specified. Helpful counts surface good reviews
      // within the page rather than reordering the feed.
      reviews: { orderBy: { createdAt: "desc" }, take: 200 },
    },
  });
  if (!shop) return null;

  const reviews = shop.reviews.map(toReviewDTO);
  const rated = reviews.filter((r) => r.rating > 0);
  const avg =
    rated.length > 0
      ? Math.round((rated.reduce((s, r) => s + r.rating, 0) / rated.length) * 10) / 10
      : null;

  const summary = toSummary(shop as ShopRow, {
    avg: avg ?? 0,
    count: reviews.length,
  });

  return {
    ...summary,
    averageRating: avg,
    reviewCount: reviews.length,
    reviews,
    insiderTips: reviews
      .filter((r) => r.insiderTip && r.insiderTip.trim().length > 0)
      .sort((a, b) => b.helpfulCount - a.helpfulCount),
  };
}

export async function allShopSlugs(): Promise<string[]> {
  const rows = await prisma.shop.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}
