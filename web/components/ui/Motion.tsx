type MotionVariant =
  "fadeUp" | "fadeIn" | "float" | "floatSlow" | "breathe" | "slideLeft" | "slideRight";

export function Motion({
  children,
  variant = "fadeUp",
  delay = "none",
  className = "",
}: {
  children: React.ReactNode;
  variant?: MotionVariant;
  delay?: "none" | "100" | "200" | "300" | "400";
  className?: string;
}) {
  const variantClass = {
    fadeUp: "motion-fade-up",
    fadeIn: "motion-fade-in",
    float: "motion-float",
    floatSlow: "motion-float-slow",
    breathe: "motion-breathe",
    slideLeft: "motion-slide-left",
    slideRight: "motion-slide-right",
  }[variant];

  const delayClass = delay === "none" ? "" : `motion-delay-${delay}`;

  return <div className={`${variantClass} ${delayClass} ${className}`}>{children}</div>;
}
