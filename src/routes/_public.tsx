import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";

// Pathless layout that wraps all public pages with header / footer / WA button
export const Route = createFileRoute("/_public")({
  component: SiteLayout,
});
