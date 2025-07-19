import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white shadow-md rounded-2xl p-6 ${className}`}>{children}</div>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
