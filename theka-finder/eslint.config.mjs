import next from "eslint-config-next";

/**
 * eslint-config-next v16 ships a flat config array directly, so the
 * FlatCompat shim the scaffold generated is unnecessary — and it crashes
 * on this ESLint version.
 */
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Prisma's generated client — not ours to lint.
      "src/generated/**",
    ],
  },
  ...next,
];

export default eslintConfig;
