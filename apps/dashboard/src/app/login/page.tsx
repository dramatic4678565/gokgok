"use client";

import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * `callbackUrl` is read from `window.location` rather than `useSearchParams`,
 * which would force the whole form behind a Suspense boundary and leave the
 * prerendered page as an empty box until hydration.
 */
function readCallbackUrl(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return new URLSearchParams(window.location.search).get("callbackUrl") ?? "/";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    const callbackUrl = readCallbackUrl();
    const result = await signIn("credentials", {
      email,
      redirect: false,
      callbackUrl,
    });

    setPending(false);

    if (!result?.ok) {
      toast.error("Enter a valid email address to continue");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex w-full max-w-sm flex-col items-center gap-8"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="text-xl font-semibold tracking-tight">Mosaic</span>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Sign in to Mosaic</CardTitle>
            <CardDescription>
              This build has no identity provider, so any email will sign you in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <LoaderCircle className="animate-spin" /> : null}
                {pending ? "Signing in…" : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
