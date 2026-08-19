import type { CategoryValue } from "@/lib/validation";
import type { OpenStatus } from "@/lib/hours";

export type ReviewDTO = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  insiderTip: string | null;
  helpfulCount: number;
  createdAt: string;
};

export type ShopSummary = {
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
  category: CategoryValue;
  verifiedToday: boolean;
  verifiedAt: string | null;
  /** Null when the shop has no reviews yet. */
  averageRating: number | null;
  reviewCount: number;
  /** Present only for proximity searches. */
  distanceKm?: number;
  status: OpenStatus;
};

export type ShopDetail = ShopSummary & {
  reviews: ReviewDTO[];
  /** Highest-voted insider tips, dive bars only. */
  insiderTips: ReviewDTO[];
};
