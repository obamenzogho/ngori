import AdminHeader from '@/app/components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] dot-grid">
      <AdminHeader />
      {children}
    </div>
  );
}
