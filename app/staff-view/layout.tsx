import { DashboardHeader } from "@/components/ui/DashboardHeader";

export default function StaffViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <DashboardHeader />
      <div className="flex-1 flex overflow-hidden relative">{children}</div>
    </div>
  );
}
