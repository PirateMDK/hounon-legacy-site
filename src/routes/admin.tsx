import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import AdminLayout from "@/components/AdminLayout";
import { Toaster } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Hounon Propre" }] }),
  component: AdminShell,
});

function AdminShell() {
  const { pathname } = useLocation();
  if (pathname === "/admin/login") {
    return (<><Toaster theme="dark" position="top-center" /><Outlet /></>);
  }
  return (
    <>
      <Toaster theme="dark" position="top-center" />
      <AdminLayout><Outlet /></AdminLayout>
    </>
  );
}
