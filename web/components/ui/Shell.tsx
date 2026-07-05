import type { ReactNode } from "react";

export function Shell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`mx-auto min-h-screen w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 ${className}`}
    >
      {children}
    </main>
  );
}
