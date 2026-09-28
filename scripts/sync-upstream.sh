#!/usr/bin/env bash
#
# Syncs excalidraw/excalidraw master into this repository.
#
# Designed to be run by .github/workflows/sync-upstream.yml, but works
# standalone on Linux/macOS/WSL too:
#
#   GITHUB_TOKEN=... ./scripts/sync-upstream.sh --force
#
# Options:
#   --force   Sync even when upstream has no new commits.
#
# Exit codes:
#   0  done (synced, or nothing to do)
#   1  unexpected error
#   2  upstream merge had conflicts (a PR and issue were opened for a human)

set -euo pipefail

FORCE=false
BRANCH="upstream-sync"
UPSTREAM_URL="https://github.com/excalidraw/excalidraw.git"
UPSTREAM_REF="master"

while [ $# -gt 0 ]; do
  case "$1" in
    --force) FORCE=true; shift ;;
    *) echo "unknown option: $1" >&2; exit 1 ;;
  esac
done

log()  { echo "::group::$1"; }
out()  { echo "    $1"; }
warn() { echo "::warning::$1"; }
err()  { echo "::error::$1"; }

RESULT="none"
PR_NUMBER=""
CONFLICTS=""

cleanup() {
  # Never leave the runner in a half-merged state.
  if [ -f .git/MERGE_HEAD ]; then
    git merge --abort || true
  fi
}
trap cleanup EXIT

# --- 1. remotes and fetch ----------------------------------------------------

log "Fetching upstream"
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$UPSTREAM_URL"
git fetch --no-tags --quiet upstream "$UPSTREAM_REF"

git checkout -B main origin/main

UPSTREAM_SHA=$(git rev-parse "upstream/$UPSTREAM_REF")
BASE_SHA=$(git rev-parse HEAD)
AHEAD=$(git rev-list --count "HEAD..upstream/$UPSTREAM_REF")

echo "upstream_sha=$UPSTREAM_SHA" >> "$GITHUB_OUTPUT"
echo "base_sha=$BASE_SHA" >> "$GITHUB_OUTPUT"

if [ "$AHEAD" -eq 0 ] && [ "$FORCE" != "true" ]; then
  out "Upstream has no new commits. Nothing to do."
  exit 0
fi
out "$AHEAD new upstream commit(s) to merge."

# --- 2. prepare the sync branch ---------------------------------------------

git config user.name  "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

git checkout -B "$BRANCH"
git push --force origin "$BRANCH"

# --- 3. merge ----------------------------------------------------------------

log "Merging upstream/$UPSTREAM_REF"
if git merge --no-edit --no-ff "upstream/$UPSTREAM_REF"; then
  RESULT="clean"
  out "Merged cleanly."
  git push --force origin "$BRANCH"
else
  RESULT="conflict"
  err "Upstream merge has conflicts."
  CONFLICTS=$(git diff --name-only --diff-filter=U)
  out "$CONFLICTS"
  git merge --abort
fi

# --- 4. pull request ---------------------------------------------------------

if [ "$RESULT" = "clean" ]; then
  PR_BODY=$(cat <<EOF
Automatic sync of [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) \`$UPSTREAM_REF\` into this repo.

- Upstream commit: \`$UPSTREAM_SHA\`
- New commits merged: $AHEAD
- Merge result: **clean**
EOF
)
else
  PR_BODY=$(cat <<EOF
Automatic sync of [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) \`$UPSTREAM_REF\` into this repo.

- Upstream commit: \`$UPSTREAM_SHA\`
- New commits: $AHEAD
- Merge result: **CONFLICT** — this was *not* merged automatically.

## Action required

Conflicting files:

\`\`\`
$CONFLICTS
\`\`\`

Resolve it locally:

\`\`\`powershell
./scripts/sync-upstream.ps1 -Resolve
# fix the files, then:
./scripts/sync-upstream.ps1 -PushResolve
\`\`\`

After that, merge this PR.
EOF
)
fi

log "Opening or updating the pull request"
PR_TITLE="chore: sync upstream excalidraw ($AHEAD new commits)"
EXISTING=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number // empty')

if [ -n "$EXISTING" ]; then
  out "Updating existing PR #$EXISTING"
  gh pr edit "$EXISTING" --title "$PR_TITLE" --body "$PR_BODY"
  PR_NUMBER="$EXISTING"
else
  gh pr create --head "$BRANCH" --base main --title "$PR_TITLE" --body "$PR_BODY"
  PR_NUMBER=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number')
  out "Created PR #$PR_NUMBER"
fi

# --- 5. finish ---------------------------------------------------------------

if [ "$RESULT" = "clean" ]; then
  log "Enabling auto-merge"
  if gh pr merge "$PR_NUMBER" --auto --merge; then
    out "Auto-merge enabled. main will update on its own."
  else
    warn "Could not enable auto-merge (is 'Allow auto-merge' on in repo settings?)."
    warn "Merge PR #$PR_NUMBER manually."
  fi
  exit 0
fi

log "Opening an issue so this is not missed"
OPEN_ISSUE=$(gh issue list --search "upstream sync needs a manual merge" --state open --json number --jq '.[0].number // empty')
if [ -z "$OPEN_ISSUE" ]; then
  ISSUE_BODY=$(cat <<EOF
PR #$PR_NUMBER has merge conflicts with \`excalidraw/excalidraw\` and was not merged automatically.

Conflicting files:

\`\`\`
$CONFLICTS
\`\`\`

To finish the update:

\`\`\`powershell
./scripts/sync-upstream.ps1 -Resolve
# fix the files, then:
./scripts/sync-upstream.ps1 -PushResolve
\`\`\`

Then merge PR #$PR_NUMBER.
EOF
)
  gh issue create --title "Upstream sync needs a manual merge" --body "$ISSUE_BODY"
  out "Issue opened."
else
  out "Issue #$OPEN_ISSUE already tracking this."
fi

exit 2
