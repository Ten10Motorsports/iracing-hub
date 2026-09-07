# iRacing Hub

A personal iRacing dashboard — **Setup Builder** + **League Schedule** — hosted on GitHub Pages with your data stored directly in this repo as JSON files.

---

## Features

- **Setup Builder** — Describe what your car is doing wrong (loose on entry, tight on exit, oversteer mid-corner, etc.) and get prioritized setup adjustments with explanations. Supports Oval/Stock Car and GT/Sports Car.
- **My Setups** — Save any recommendation to your personal library. Searchable by car, track, or notes.
- **League Schedule** — Track all your upcoming league races with live countdown timers to each race start.

---

## Setup (5 minutes)

### 1. Fork or clone this repo

```
git clone https://github.com/YOUR_USERNAME/iracing-hub.git
cd iracing-hub
```

### 2. Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch, **/ (root)** folder
4. Click **Save**

Your app will be live at `https://YOUR_USERNAME.github.io/iracing-hub/` within a minute or two.

### 3. Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens/new?scopes=repo&description=iRacing%20Hub)
2. Give it a name like **iRacing Hub**
3. Check the **`repo`** scope
4. Click **Generate token** and copy it

> ⚠️ Keep this token private. It's stored only in your browser's localStorage — never in the repo.

### 4. Configure the app

1. Open your app URL (`https://YOUR_USERNAME.github.io/iracing-hub/`)
2. Click **GitHub** in the top right
3. Enter your GitHub username, repo name (`iracing-hub`), and token
4. Click **Save & Test Connection**

That's it! Your setups and race schedule are now saved directly to `data/setups.json` and `data/schedule.json` in this repo whenever you save them from the app.

---

## Data files

| File | Contents |
|------|----------|
| `data/setups.json` | Your saved setup recommendations |
| `data/schedule.json` | Your league race schedule |

Both files are plain JSON — you can edit them directly in GitHub's web editor if you want to bulk-import or clean up entries.

---

## Setup Knowledge Base

The setup recommendations live in `js/setup-engine.js`. Each problem (e.g. "Oval / Loose / Entry") maps to a list of fixes with:
- The specific adjustment to make
- Why it helps (the physics reasoning)

You can extend this file with your own adjustments for specific cars or tracks.

---

## Questions / Issues

This is a personal tool. Fork it and make it your own!
