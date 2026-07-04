export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[3rem] border border-line bg-paper p-8 brand-shadow ${className}`}
    >
      {children}
    </div>
  );
}
