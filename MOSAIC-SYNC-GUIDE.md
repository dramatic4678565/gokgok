# Mosaic — Upstream Sync Guide

Apnar project `mosaic` ekhon `excalidraw/excalidraw` er upor based. Excalidraw niyomito update hoy (protiponche koyek hundred commit), tai ekta **auto-sync system** banano hoye geche — jate apnar PC/off thakleo apnar repo nije theke update hoye jay.

---

## 1. Ki ki seta kora holo

| Jinis               | Kothay                                      |
| ------------------- | ------------------------------------------- |
| Apnar repo          | `https://github.com/dramatic4678565/mosaic` |
| Upstream (source)   | `https://github.com/excalidraw/excalidraw`  |
| Apnar main branch   | `D:\custode-code-website\web\mosaic`        |
| Auto-sync workflow  | `.github/workflows/sync-upstream.yml`       |
| Local helper script | `scripts/sync-upstream.ps1`                 |

### Remotes

Apnar repo-r duita remote ache:

- **`origin`** → `https://github.com/dramatic4678565/mosaic.git` (apnar kaj, ekhane push kora hoy)
- **`upstream`** → `https://github.com/excalidraw/excalidraw.git` (asol Excalidraw, ekeno push korar dorkar nai)

Check korte:

```powershell
git remote -v
```

---

## 2. ⚠️ APNAR KAJ BAQI ACHE (3 ta step)

Ei step gulo ami korte parini, karon ei PC-r Git login kora account `goglprt45646` — kintu apnar repo-r owner `dramatic4678565`. Tai ekhon push korle permission denied ashbe.

### Step 1 — GitHub Desktop-e account bodlao

1. GitHub Desktop khulo
2. Left-bottom-e apnar profile photo / account name-e click koro
3. **Sign out** select koro
4. **Add account** → `dramatic4678565` diye login koro

### Step 2 — Ami ke amake bolun

Login shesh korle amake bolun. Ami:

- `main` branch push korbo apnar `mosaic` repo-te
- workflow + script push korbo
- repo-r default branch `main` set korbo

### Step 3 — GitHub-e Actions enable korun (ekbar-i)

Push diye amake bolun, ami enable kore dite pari. Noyto apni nije:

1. Apnar repo kholun → **Actions** tab
2. Ekta box e likha thakbe: "Workflows aren't being run on this fork / Enable them"
3. **I understand my workflows, go ahead and enable them** e click korun

> **Bongyo:** workflow `main` branch e thaka SOMSHAYE chole (default behaviour)।

---

## 3. Auto-sync kivabe kaj kore

```
excalidraw master e notun commit
        ↓
GitHub Action (har 6 ghonta)
        ↓
upstream/master → apnar main e merge
        ↓
   Conflict thik ache?  ──Haan──→  PR khule, auto-merge hoy, main update hoy  ✅
        ↓ Nei
   Conflict ache?  ──Haan──→  PR + issue khule, apni resolve koren  ⚠️
```

**Apni ki korte paren seta bujhte:**

- **Conflict nai** (ghobaro beshi kaj-e eivabe hoy) → apnar PC-r/off thakleo **apni kichu korte paren na**. Apnar `main` nije theke update hoye jabe. Eta-i j beshi majority case.
- **Conflict ache** (apni ar excalidraw-r ei eki file e change korechen) → eta apni nije resolve korte hobe. Details niche section 5 e.

### Action hoy koto porjonto check korbe

- **6 ghonta por 6 ghonta** (schedule). PC bondh thakleo chole.
- GitHub occasionally schedule delay kore — eta normal, panic korar dorkar nai.

### Notun commit matro `:03` (scheduled)

Upstream e kichu na thakle Action kichu korbe na — apnar repo untouched thakbe.

---

## 4. Apni nijei manually update korte charen

```powershell
# Ki kono update ache kina dekhte
.\scripts\sync-upstream.ps1 -Status

# Noyun commit gulo niye aste (merge kore, push kore)
.\scripts\sync-upstream.ps1 -Sync
```

`-Sync` run korle script nije theke:

1. `upstream` theke latest master fetch kore
2. `main` e merge kore
3. `origin/main` e push kore

Conflict dhakhle eta nijer `main` ke corrupt chore na — eta abort kore apnake warning dey.

---

## 5. Conflict hole ki korben (eta-i j ekhon-i apni lagbe)

Ami apnake ekta warning dibo. 3 ta command:

```powershell
# 1. Sync branch e chole eshob merge kora
#    (eta ja-i CI conflict khachilo, oita locally reproduce kore)
.\scripts\sync-upstream.ps1 -Resolve
```

Eita kon kon file e conflict ache list korbe, ar merge-ta pending state e rakhbe.

```powershell
# 2. Ondesho file gulo text editor e kholun
#    <>=====> markers er duita pasher ja rakhte chan seta rakho
#    marker gulo delete kore save koro
#    tarpor:  git add .

# 3. Push kore PR ready kore dao
.\scripts\sync-upstream.ps1 -PushResolve
```

`-PushResolve` verify kore je shob upstream commit sheshbhabe eshobheseeche kina. Na thakle apnake bole dey — false "sab kichu hoye geche" message dey na.

Tarpor GitHub-e PR ta merge kore DAO (auto-merge conflict-e chole na, tai ekbar tap korte hobe).

**Jodi bhul kore `-Resolve` chala na `-PushResolve` chaliye felen**, script detect korbe upstream er kichu merge hoy nai, ar bolbe abar `-Resolve` chalate. Apnar kaaj nosto hobe na.

Ami `merge.conflictstyle = diff3` config kore diyechi — tai conflict-e **common ancestor** o dekhay. Eta resolution onek easy kore.

### GitHub Desktop diye korte chan?

Korte paren. `upstream-sync` branch e switch kore `upstream/master` merge kore conflict solve koro, tarpor `origin/upstream-sync` e push koro. Etabe GitHub-e PR ta mergeable hoye jabe.

---

## 6. Apnar nijer change gulo kivabe korben

**Bhalo practice** — apnar kaaj direct `main` e na kore ekta alada branch e kora:

```
main                    ← sirf upnar-update, kintu clean
 └─ feat/my-feature     ← apnar kaj
```

GitHub Desktop e:

1. Current branch e click kore **New Branch** → `feat/my-feature`
2. Kaj koro
3. **Commit to main** e click kore **Commit to feat/my-feature** select koro
4. **Push origin** e click koro
5. GitHub e PR khule merge koro

Eivabe apnar kaj upstream update theke alada thakay — conflict beshi kom hobe.

### Conflict komabar tips

Excalidraw er ei file gulo **beshi frequent change hoy**, tai eigulo sokhe edit korar dhoyob na (jodi na paren):

- `packages/excalidraw/**`
- `packages/element/**`
- `packages/common/**`
- `packages/excalidraw/index.tsx`

Apni nijer feature beshirbhag eivabe likhte paren:

- Alada file banano
- Apni nije banano component gulo use kora

---

## 7. Frequent kaj (command reference)

```powershell
# Notun code anen (apni ba onyo kono push korle)
git pull

# Apni ki upstream er theke peyechen?
git log --oneline -5

# Ki ki conflict hocche?
git diff --name-only --diff-filter=U

# Ki ki branch ache?
git branch -a

# Script e ki kora ache?
.\scripts\sync-upstream.ps1 -Help
```

### GitHub Desktop e regular kaj

| Button             | Ki kore                                    |
| ------------------ | ------------------------------------------ |
| **Fetch origin**   | Apnar `mosaic` repo theke newest code anay |
| **History**        | Ki ki commit hocche dekha jay              |
| **Current branch** | Branch switch / notun branch banano        |
| **Push origin**    | Apnar kaaj GitHub-e pathay                 |

> **Jano:** GitHub Desktop **"Fetch origin"** `upstream` theke kichu anay **na** — oita sudhu apnar `mosaic` repo-r kaj kore. Upstream anar kaaj **server-e** hoy (Action) ba `sync-upstream.ps1` diye hoy. Eta normal, kono bhool na.

---

## 8. GitHub-e PR te ki dekhbo

Workflow PR gulo create kore:

- **Title:** `chore: sync upstream excalidraw (N new commits)`
- **Branch:** `upstream-sync` → `main`
- Conflicted hole body te kon kon file, sob likha thakbe

Link: https://github.com/dramatic4678565/mosaic/pulls

---

## 9. Jenochintu jinis (mon dhore rekho)

1. **`main` ke force-push korben na.** Force-push korle apnar custom kaaj chole jabe ar future sync bhitre kaj kora sammoy remote history chole jay.
2. **Workflow Action tab theke "Run workflow"** diye jekhono shomoy manually trigger kora jay.
3. **Auto-merge Action** jeno cholo, repo-r auto-merge feature ON kina check korun: Settings → General → Features → **Allow auto-merge** ON.
4. **60 din e kono activity na thakle GitHub scheduled workflow disable kore dey.** Eta ghosey na — Settings → Actions e giye workflow enable kore din, ba amake bolun.
5. **`upstream` remote-r kichu push korar dorkar nai** (oita Excalidraw-r repo).

---

## 10. Everything ek nazar e

```powershell
.\scripts\sync-upstream.ps1 -Status
```

Eta janay:

- kon branch e achen
- koto upstream commit pending
- apni koto din er modhye update chuyen
