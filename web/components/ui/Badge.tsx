type BadgeTone = "green" | "blue" | "orange" | "red";

export function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  const toneClass = {
    green: "bg-green-soft text-green",
    blue: "bg-blue-soft text-blue",
    orange: "bg-orange-soft text-orange",
    red: "bg-red-soft text-red",
  }[tone];

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-black ${toneClass}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-current" />
      {children}
    </div>
  );
}
