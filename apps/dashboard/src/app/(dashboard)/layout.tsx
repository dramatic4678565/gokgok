import { DashboardShell } from "@/components/dashboard/DashboardShell";

/**
 * Server component: it only contributes the frame, so the shell stays a client
 * component and every interactive page below it shares one `DndContext`.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
