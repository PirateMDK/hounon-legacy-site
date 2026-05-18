import { createFileRoute, Outlet } from "@tanstack/react-router";
import AdminLayout from "@/components/AdminLayout";
import { Toaster } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Hounon Propre" }] }),
  component: () => (
    <>
      <Toaster theme="dark" position="top-center" />
      <AdminLayout><Outlet /></AdminLayout>
    </>
  ),
});
