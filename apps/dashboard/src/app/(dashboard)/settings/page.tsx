"use client";

import { Palette, ShieldCheck, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoards } from "@/lib/hooks/useBoards";
import { useFolders } from "@/lib/hooks/useFolders";
import { showUpstreamPromos } from "@/lib/dashboard/constants";

function initials(name: string | null | undefined): string {
  if (!name) {
    return "?";
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const { data: boards = [] } = useBoards({});
  const { data: folders = [] } = useFolders();

  // Kept local: there is no profile endpoint to persist to yet, and pretending
  // otherwise would be worse than being explicit.
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);

  const user = session?.user;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and how Mosaic looks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4 text-muted-foreground" />
            Profile
          </CardTitle>
          <CardDescription>How you appear on boards you share.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              {user?.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback className="text-base">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {status === "loading" ? "Loading…" : (user?.name ?? "Signed in")}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? "No email on file"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={displayName}
                placeholder={user?.name ?? "Your name"}
                maxLength={80}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setSaved(false);
                }}
              />
              <Button
                disabled={!displayName.trim() || saved}
                onClick={() => setSaved(true)}
              >
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Names are not persisted in this build — there is no profile
              endpoint yet.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4 text-muted-foreground" />
            Appearance
          </CardTitle>
          <CardDescription>
            Mosaic follows your system theme by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">
              Currently {theme ?? "system"}.
            </p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>What is in this account right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Boards
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {boards.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Favorites
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {boards.filter((board) => board.isFavorite).length}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Folders
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {folders.length}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {showUpstreamPromos ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-muted-foreground" />
              Paid workspace
            </CardTitle>
          </CardHeader>
        </Card>
      ) : null}

      {status === "loading" ? <Skeleton className="h-10 w-full" /> : null}
    </div>
  );
}
