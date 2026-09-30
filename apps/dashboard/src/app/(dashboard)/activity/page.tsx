import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity" };

export default function ActivityPage() {
  return <ActivityFeed />;
}
