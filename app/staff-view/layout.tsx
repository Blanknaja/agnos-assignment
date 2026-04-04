export default function StaffViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex overflow-hidden relative">
      {children}
    </div>
  );
}
