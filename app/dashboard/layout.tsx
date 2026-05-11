import { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <div className="min-h-screen bg-slate-950 p-3 text-slate-100 sm:p-4">{children}</div>;
}
