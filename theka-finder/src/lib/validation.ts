import { z } from "zod";
import { MUMBAI_BOUNDS } from "./constants";

export const categorySchema = z.enum(["standard", "legendary", "dive_bar"]);
export type CategoryValue = z.infer<typeof categorySchema>;

/** "HH:MM-HH:MM" or the literal "closed". */
const HOURS_RE = /^(?:closed|([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d)$/i;

export const hoursSchema = z
  .string()
  .trim()
  .refine((v) => HOURS_RE.test(v), {
    message: 'Hours must look like "10:00-22:30" or "closed"',
  });

/** One entry in data/shops.json. */
export const seedShopSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(300),
  area: z.string().trim().min(1).max(80),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  latitude: z
    .number()
    .min(MUMBAI_BOUNDS.minLat, "Latitude is outside Mumbai")
    .max(MUMBAI_BOUNDS.maxLat, "Latitude is outside Mumbai"),
  longitude: z
    .number()
    .min(MUMBAI_BOUNDS.minLng, "Longitude is outside Mumbai")
    .max(MUMBAI_BOUNDS.maxLng, "Longitude is outside Mumbai"),
  phone: z.string().trim().max(40).nullish(),
  // Absent means genuinely unknown. Most imported listings have no hours,
  // and inventing them would make the badge lie.
  hoursWeekday: hoursSchema.nullish(),
  hoursWeekend: hoursSchema.nullish(),
  category: categorySchema.default("standard"),
  verifiedToday: z.boolean().default(false),
  source: z.enum(["curated", "osm", "overture", "community"]).default("curated"),
  osmId: z.string().trim().min(1).nullish(),
  overtureId: z.string().trim().min(1).nullish(),
});

export type SeedShop = z.infer<typeof seedShopSchema>;
export const seedFileSchema = z.array(seedShopSchema).min(1);

/** Review submission from the public form. */
export const reviewInputSchema = z.object({
  authorName: z
    .string()
    .trim()
    .max(40, "Keep the name under 40 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : "Anonymous")),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Pick between 1 and 5 stars")
    .max(5, "Pick between 1 and 5 stars"),
  body: z
    .string()
    .trim()
    .min(3, "Say a little more than that")
    .max(1000, "Keep it under 1000 characters"),
  insiderTip: z
    .string()
    .trim()
    .max(400, "Keep the tip under 400 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type ReviewInput = z.input<typeof reviewInputSchema>;

/** Query params for GET /api/shops. */
export const shopQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  q: z.string().trim().max(80).optional(),
  category: categorySchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * A shop submitted by a member of the public. Deliberately forgiving:
 * hours and phone are optional because someone standing outside a shop
 * knows its name and where it is, and little else. Everything lands as
 * pending, so a human sees it before it reaches the map.
 */
export const shopSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Give the shop's name")
    .max(120, "That name is too long"),
  address: z
    .string()
    .trim()
    .min(4, "Roughly where is it? A street or landmark is enough")
    .max(300, "Keep the address shorter"),
  area: z
    .string()
    .trim()
    .min(2, "Pick a Mumbai neighbourhood")
    .max(80),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  latitude: z
    .number()
    .min(MUMBAI_BOUNDS.minLat, "That pin is outside Mumbai")
    .max(MUMBAI_BOUNDS.maxLat, "That pin is outside Mumbai"),
  longitude: z
    .number()
    .min(MUMBAI_BOUNDS.minLng, "That pin is outside Mumbai")
    .max(MUMBAI_BOUNDS.maxLng, "That pin is outside Mumbai"),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  hoursWeekday: hoursSchema.optional().or(z.literal("").transform(() => undefined)),
  hoursWeekend: hoursSchema.optional().or(z.literal("").transform(() => undefined)),
  /// What the submitter thinks it is. Only a suggestion — curation is manual.
  suggestedCategory: categorySchema.default("standard"),
  submittedByName: z
    .string()
    .trim()
    .max(40, "Keep the name under 40 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : "Anonymous")),
  note: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type ShopSubmissionInput = z.input<typeof shopSubmissionSchema>;
