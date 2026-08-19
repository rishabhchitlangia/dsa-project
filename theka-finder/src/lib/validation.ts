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
  hoursWeekday: hoursSchema,
  hoursWeekend: hoursSchema,
  category: categorySchema.default("standard"),
  verifiedToday: z.boolean().default(false),
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
