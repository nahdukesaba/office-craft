# SILAP Aset — Office Booking Calendar

**Sistem Informasi Laporan Pemakaian Aset** — a public booking calendar for shared office resources (rooms, cars, bikes), with an approval workflow and proof-of-use photo uploads.

Built with TanStack Start (React 19) + TanStack Router/Query, Tailwind v4, shadcn/ui, and Bun.

---

## Contents

- [Prerequisites](#prerequisites)
- [First-time setup](#first-time-setup)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [Demo login](#demo-login)
- [Production build & deploy run](#production-build--deploy-run)
- [Scripts reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

This project uses **Bun** as the package manager and runtime, not npm/yarn/pnpm. Install it first.

| Requirement | Version |
|---|---|
| [Bun](https://bun.sh) | latest (1.1+) |
| Git | any recent version |

You do **not** need Node.js installed separately — Bun bundles its own runtime. If you already have Node.js for other projects, that's fine too; it won't conflict.

### Installing Bun — Windows 10

Open **PowerShell** (not cmd.exe) and run:

```powershell
irm bun.sh/install.ps1 | iex
```

Close and reopen PowerShell, then confirm it installed:

```powershell
bun --version
```

> If PowerShell blocks the script with an execution-policy error, run this once first, then retry the install:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

### Installing Bun — Ubuntu

```bash
curl -fsSL https://bun.sh/install | bash
```

Then reload your shell config so `bun` is on your `PATH`:

```bash
source ~/.bashrc   # or ~/.zshrc if you use zsh
bun --version
```

If `unzip` is missing (Bun's installer needs it), install it first:

```bash
sudo apt update && sudo apt install -y unzip
```

---

## First-time setup

Same steps on both operating systems once Bun is installed.

```bash
# 1. Clone the repo
git clone https://github.com/nahdukesaba/office-craft.git
cd office-craft

# 2. Install dependencies
bun install
```

That's it — no database, no Docker, no build step required before running locally. The app ships with a **mock data layer enabled by default** (see [Environment variables](#environment-variables)), so it runs fully self-contained without a real backend.

---

## Running locally

```bash
bun run dev
```

This starts the Vite dev server. Open the URL it prints (default **http://localhost:3000**) in your browser.

- Windows 10: run this from PowerShell or Windows Terminal inside the project folder.
- Ubuntu: run this from your regular terminal inside the project folder.

Stop the server anytime with `Ctrl+C`.

---

## Environment variables

No `.env` file is required to run the app locally — every variable below has a working default. Create a `.env` file in the project root only if you want to override something:

```bash
# .env (all optional)

# Point the app at a real backend instead of using mock data.
VITE_API_BASE_URL=https://your-api.example.com/api

# Set to "false" to use the real API instead of the built-in mock data layer.
# Defaults to "true" (mocks on) if unset.
VITE_USE_MOCKS=true

# Set to "false" to allow uploading proof photos from the gallery
# instead of requiring a live camera capture. Defaults to "true".
VITE_PROOF_CAMERA_ONLY=true
```

Restart `bun run dev` after changing `.env` — Vite only reads it on startup.

---

## Demo login

With mocks enabled (the default), sign in with either of these — no password required by the mock layer:

| Role | Email |
|---|---|
| Admin | `admin@example.com` |
| Regular user | `user@example.com` |

The admin account can manage resources and approve/reject bookings; the regular user can browse resources and submit booking requests.

---

## Production build & deploy run

Use this to build the app the way it will run in production and serve that build locally — useful for catching build-only issues before deploying.

### 1. Build

```bash
bun run build
```

Output goes to `.output/` (Nitro's build directory; the project targets the **Vercel** preset).

### 2. Preview the production build

```bash
bun run preview
```

This serves the built app locally so you can sanity-check it before shipping. Open the URL it prints in your browser.

### Windows 10 notes

Run both commands from the same PowerShell/Windows Terminal session, in the project directory:

```powershell
bun run build
bun run preview
```

### Ubuntu notes

Same commands, any terminal:

```bash
bun run build
bun run preview
```

### Deploying to Vercel

Since the build targets Vercel's Nitro preset (`vite.config.ts` → `nitro: { preset: "vercel" }`), the simplest path to a real deployment is the Vercel CLI, which works identically on both operating systems once Bun is installed:

```bash
bun add -g vercel   # one-time global install
vercel login
vercel               # first deploy — follow the prompts to link/create a project
vercel --prod        # subsequent production deploys
```

Set any variables from [Environment variables](#environment-variables) in the Vercel project's dashboard (Settings → Environment Variables) if you're pointing at a real backend — otherwise the deployed app will run in mock mode by default, same as local dev.

---

## Scripts reference

| Command | What it does |
|---|---|
| `bun run dev` | Start the local dev server with hot reload |
| `bun run build` | Production build (outputs to `.output/`) |
| `bun run build:dev` | Build in development mode (unminified, for debugging a build issue) |
| `bun run preview` | Serve the last production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format the codebase with Prettier |

---

## Troubleshooting

**`bun: command not found` after installing (Ubuntu/WSL)**
Your shell hasn't picked up the new `PATH`. Run `source ~/.bashrc` (or open a new terminal tab) and try again.

**PowerShell won't run the Bun install script**
See the execution-policy fix under [Installing Bun — Windows 10](#installing-bun--windows-10).

**Port 3000 already in use**
Stop whatever else is using it, or let Vite pick another port — it will prompt you and pick the next free one automatically.

**App loads but nothing works / API errors**
Check whether `VITE_USE_MOCKS` was accidentally set to `false` in your `.env` without a valid `VITE_API_BASE_URL` pointing at a real backend. Remove the `.env` file (or set `VITE_USE_MOCKS=true`) to fall back to mock data.