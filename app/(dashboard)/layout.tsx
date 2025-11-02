import { AuthProvider } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout'; // Sesuaikan nama file

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthProvider>
  );
}