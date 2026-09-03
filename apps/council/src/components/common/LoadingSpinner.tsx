import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-4 text-slate-100 ${className}`}
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-emerald-400`}
      />
      {text && <p className="text-xs font-mono font-medium text-slate-400">{text}</p>}
    </div>
  );
};
