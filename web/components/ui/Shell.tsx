import { AnimatedBackdrop } from "./AnimatedBackdrop";

export function Shell({
  children,
  backdrop = true,
}: {
  children: React.ReactNode;
  backdrop?: boolean;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      {backdrop && <AnimatedBackdrop />}

      <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8">{children}</div>
    </main>
  );
}
