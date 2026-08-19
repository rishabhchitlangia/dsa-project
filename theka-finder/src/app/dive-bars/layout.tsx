/**
 * Scopes the dive-bar visual treatment. Everything inside gets the dark,
 * warm, grainy palette; the rest of the site never sees it.
 */
export default function DiveBarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-dive dive-grain relative">{children}</div>;
}
