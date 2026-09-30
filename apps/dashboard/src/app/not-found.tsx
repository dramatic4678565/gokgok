import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The board or folder you were looking for may have been moved to Trash.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Back to your boards</Link>
      </Button>
    </main>
  );
}
