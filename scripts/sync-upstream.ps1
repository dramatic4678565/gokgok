<#
.SYNOPSIS
  Keeps this repo in sync with excalidraw/excalidraw.

.DESCRIPTION
  Three modes:

    -Sync     (default) Fetch upstream and merge its new commits into `main`,
                        then push. Run this to update manually.

    -Resolve  Used when the automated sync reports conflicts. Checks out the
              `upstream-sync` branch and merges `main` into it. If it hits
              conflicts it stops, lists the files, and tells you what to fix.

    -PushResolve  Run AFTER you have fixed the conflict files and staged them.
                  Commits and pushes so the pull request becomes mergeable.

    -Status   Just show where things stand. Makes no changes.

.EXAMPLE
  ./scripts/sync-upstream.ps1
  ./scripts/sync-upstream.ps1 -Sync
  ./scripts/sync-upstream.ps1 -Resolve
  ./scripts/sync-upstream.ps1 -PushResolve
#>
[CmdletBinding()]
param(
  [switch]$Sync,
  [switch]$Resolve,
  [switch]$PushResolve,
  [switch]$Status
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

function Write-Step  { param($m) Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok    { param($m) Write-Host "    $m" -ForegroundColor Green }
function Write-Warn  { param($m) Write-Host "    $m" -ForegroundColor Yellow }
function Write-Fail  { param($m) Write-Host "    $m" -ForegroundColor Red }

function Invoke-Git {
  param([string[]]$GitArgs, [switch]$AllowFailure)
  # git writes progress and branch-switch notices to stderr. With
  # $ErrorActionPreference = 'Stop' PowerShell turns that into a terminating
  # NativeCommandError, so it has to be relaxed for the call itself.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $out = & git @GitArgs 2>&1
    $code = $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $prev
  }
  $text = ($out | ForEach-Object { if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.ToString() } else { "$_" } }) -join "`n"
  if ($code -ne 0 -and -not $AllowFailure) {
    $text -split "`n" | Where-Object { $_ } | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    throw "git $($GitArgs -join ' ') failed with exit code $code"
  }
  return @{ Output = $text; Code = $code }
}

function Test-Dirty {
  # Untracked files are ignored: they do not block a merge (unless the incoming
  # commit has the same path), and they are normal while you are working.
  $r = Invoke-Git @('status', '--porcelain', '--untracked-files=no')
  return -not [string]::IsNullOrWhiteSpace($r.Output)
}

function Get-Remotes {
  $r = Invoke-Git @('remote')
  return @($r.Output -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

# --- preflight ---------------------------------------------------------------

$remotes = Get-Remotes
if ($remotes -notcontains 'upstream') {
  Write-Step "Adding upstream remote"
  Invoke-Git @('remote', 'add', 'upstream', 'https://github.com/excalidraw/excalidraw.git') | Out-Null
  Write-Ok "upstream = https://github.com/excalidraw/excalidraw.git"
}
if ($remotes -notcontains 'origin') {
  Write-Fail "No 'origin' remote. Run: git remote add origin https://github.com/dramatic4678565/mosaic.git"
  Pop-Location; exit 1
}

# -Status is read only, and -PushResolve is *meant* to run with staged changes,
# so only -Sync and -Resolve need a clean tree (they perform merges).
$needsCleanTree = ($Sync -or (-not $Resolve -and -not $PushResolve -and -not $Status))

if ($needsCleanTree -and (Test-Dirty)) {
  Write-Fail "You have uncommitted changes. Commit or stash them first, then run this again."
  $s = Invoke-Git @('status', '--short')
  $s.Output | ForEach-Object { Write-Host "    $_" }
  Pop-Location; exit 1
}

# --- helpers -----------------------------------------------------------------

function Get-UpstreamDiffCount {
  $r = Invoke-Git @('rev-list', '--count', "$Ref..upstream/master") -AllowFailure
  if ($r.Code -ne 0) { return -1 }
  return [int]$r.Output.Trim()
}

function Show-Status {
  Write-Step "Current state"
  $branch = (Invoke-Git @('rev-parse', '--abbrev-ref', 'HEAD')).Output.Trim()
  Write-Host "    on branch: $branch"
  Invoke-Git @('fetch', '--quiet', 'upstream', 'master') | Out-Null
  $n = Get-UpstreamDiffCount -Ref 'main'
  if ($n -lt 0) {
    Write-Warn "Could not compare (local main missing?). Try: ./scripts/sync-upstream.ps1 -Sync"
  } elseif ($n -eq 0) {
    Write-Ok "main is up to date with excalidraw/excalidraw"
  } else {
    Write-Host "    $n new upstream commit(s) waiting. Run: ./scripts/sync-upstream.ps1 -Sync"
  }
  $pr = (Invoke-Git @('log', '--oneline', '-1') -AllowFailure).Output.Trim()
  if ($pr) { Write-Host "    last local commit: $pr" }
}

# --- modes -------------------------------------------------------------------

try {
  if ($Status) {
    Show-Status
  }
  elseif ($Resolve) {
    Write-Step "Preparing to resolve the sync conflicts"
    Invoke-Git @('fetch', 'origin', 'main', 'upstream-sync') -AllowFailure | Out-Null

    # Resetting to origin/upstream-sync would silently drop any local commits on
    # this branch, so refuse instead of destroying work.
    $localBranch = (Invoke-Git @('rev-parse', '--verify', 'refs/heads/upstream-sync') -AllowFailure)
    if ($localBranch.Code -eq 0) {
      $ahead = (Invoke-Git @('rev-list', '--count', 'origin/upstream-sync..upstream-sync') -AllowFailure)
      $n = 0
      if ($ahead.Code -eq 0) { [void][int]::TryParse($ahead.Output.Trim(), [ref]$n) }
      if ($n -gt 0) {
        Write-Fail "You have $n unpushed commit(s) on upstream-sync. This would be thrown away."
        Invoke-Git @('log', '--oneline', 'origin/upstream-sync..upstream-sync') | Out-Null
        $l = Invoke-Git @('log', '--oneline', 'origin/upstream-sync..upstream-sync')
        $l.Output | ForEach-Object { Write-Host "      $_" }
        Write-Host ""
        Write-Host "    Push them first, or move them to a different branch, then run this again."
        Pop-Location; exit 1
      }
    }

    Invoke-Git @('checkout', '-B', 'upstream-sync', 'origin/upstream-sync') | Out-Null
    Write-Ok "checked out upstream-sync"

    # The conflict is between our main and upstream's master, so that is the
    # merge that has to be resolved. upstream-sync was branched from main, so
    # merging upstream/master here reproduces the CI conflict and lets you fix
    # it. Merging origin/main instead would be a no-op and resolve nothing.
    Invoke-Git @('fetch', 'upstream', 'master') -AllowFailure | Out-Null
    $m = Invoke-Git @('merge', '--no-edit', '--no-ff', 'upstream/master') -AllowFailure
    if ($m.Code -ne 0) {
      Write-Fail "Conflicts found. Fix these files, then `git add` them:"
      $c = Invoke-Git @('diff', '--name-only', '--diff-filter=U')
      $c.Output | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
      Write-Host ""
      Write-Host "    Open each file, look for <<<<<<< / ======= / >>>>>>> markers,"
      Write-Host "    keep the parts you want, delete the markers, save, then run:"
      Write-Host "      git add ."
      Write-Host "      ./scripts/sync-upstream.ps1 -PushResolve"
      Pop-Location; exit 1
    }
    Write-Ok "Merged cleanly, nothing to fix"
    Write-Host ""
    Write-Host "    Now run: ./scripts/sync-upstream.ps1 -PushResolve"
  }
  elseif ($PushResolve) {
    Write-Step "Committing and pushing your conflict resolution"
    $staged = Invoke-Git @('diff', '--cached', '--name-only')
    if ([string]::IsNullOrWhiteSpace($staged.Output)) {
      Write-Fail "Nothing is staged. Run `git add <files>` for the files you fixed first."
      Pop-Location; exit 1
    }
    Write-Ok "staged:"
    $staged.Output | ForEach-Object { Write-Host "      $_" }
    Invoke-Git @('commit', '-m', 'fix: resolve upstream sync conflicts') | Out-Null
    Invoke-Git @('push', 'origin', 'upstream-sync') | Out-Null
    Write-Ok "pushed to origin/upstream-sync"

    # Guard against a false "all done": if upstream's commits are not actually
    # in this branch, the pull request will still show conflicts.
    Invoke-Git @('fetch', 'upstream', 'master') -AllowFailure | Out-Null
    $has = Invoke-Git @('merge-base', '--is-ancestor', 'upstream/master', 'HEAD') -AllowFailure
    Write-Host ""
    if ($has.Code -eq 0) {
      Write-Ok "This branch now includes everything from excalidraw/excalidraw."
      Write-Host "    Your pull request is ready to merge."
      Write-Host "    Merge it here: https://github.com/dramatic4678565/mosaic/pulls"
    }
    else {
      Write-Warn "Heads up: this branch does NOT include the latest excalidraw commits."
      Write-Host "    The pull request will still show conflicts. Run -Resolve, fix the"
      Write-Host "    files, stage them, then run -PushResolve again."
    }
  }
  else {
    # -Sync (default)
    Write-Step "Fetching latest from excalidraw/excalidraw"
    Invoke-Git @('fetch', 'upstream', 'master') | Out-Null
    Invoke-Git @('checkout', 'main') | Out-Null
    Invoke-Git @('pull', '--ff-only', 'origin', 'main') | Out-Null

    $n = Get-UpstreamDiffCount -Ref 'main'
    if ($n -eq 0) {
      Write-Ok "Already up to date. Nothing to do."
      Pop-Location; exit 0
    }
    Write-Host "    $n new upstream commit(s) to merge."

    Write-Step "Merging upstream/master into main"
    $m = Invoke-Git @('merge', '--no-edit', '--no-ff', 'upstream/master') -AllowFailure
    if ($m.Code -ne 0) {
      Write-Fail "Merge conflicts. Files to fix:"
      $c = Invoke-Git @('diff', '--name-only', '--diff-filter=U')
      $c.Output | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
      Write-Host ""
      Write-Host "    Aborting so you are not left in a broken state."
      Invoke-Git @('merge', '--abort') | Out-Null
      Write-Host "    Your main branch is untouched."
      Write-Host ""
      Write-Host "    Do this instead:"
      Write-Host "      ./scripts/sync-upstream.ps1 -Resolve"
      Pop-Location; exit 1
    }

    Write-Step "Pushing to origin"
    Invoke-Git @('push', 'origin', 'main') | Out-Null
    Write-Ok "Done. main now includes $n upstream commit(s)."
    Write-Host ""
    Write-Host "    Pull the latest code locally:  git pull"
  }
}
catch {
  Write-Host ""
  Write-Fail $_.Exception.Message
  Pop-Location
  exit 1
}

Pop-Location
