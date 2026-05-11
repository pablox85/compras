import { ReactNode } from "react";

type PanelTitleProps = {
  children: ReactNode;
  className?: string;
  asButton?: boolean;
  position?: "left" | "right";
};

export default function PanelTitle({
  children,
  className = "",
  asButton = false,
  position = "left",
}: PanelTitleProps) {
  const baseClasses = "text-[0.875rem] font-semibold uppercase tracking-[0.32em]";
  const positionClasses = position === "right" ? "right-4" : "left-4";

  if (asButton) {
    return (
      <div className={`absolute ${positionClasses} top-4`}>
        <div className={`rounded-lg bg-teal-900 px-3 py-2 ${className}`}>
          <p className={baseClasses}>{children}</p>
        </div>
      </div>
    );
  }

  return (
    <p className={`absolute ${positionClasses} top-4 ${baseClasses} ${className}`}>
      {children}
    </p>
  );
}