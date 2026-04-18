# Putting your site in a “container” (simple explanation)

**Source repo:** [github.com/WileyOne/wilservice.us](https://github.com/WileyOne/wilservice.us)

**Goal:** TrueNAS runs your website from a **ready-made package** (an **image**) instead of a normal folder on the disk.

You need **Docker Desktop** on your Mac once: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/). Open it and leave it running while you work.

---

## What you’re actually doing (in order)

1. **Prove to GitHub you’re you** — GitHub gives you a **token** (a long password **only for uploads**). Your normal GitHub password does **not** work here.
2. **Tell Docker that token** — so it can upload to GitHub’s package storage (`ghcr.io`).
3. **Build** — Docker reads the **`Dockerfile`** in this folder and builds the image (your pages + a tiny web server).
4. **Push** — Docker uploads that image to `ghcr.io` under **your** username.
5. **On TrueNAS** — you paste that image name into a **Custom App** and map port **8080** to **80**. No website folder on TrueNAS required.

---

## Step 1 — GitHub token (one time)

1. GitHub.com → your **photo** (top right) → **Settings**.
2. Left side, bottom: **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
3. **Generate new token (classic)**.
4. Enable **`write:packages`** (upload). **`read:packages`** is fine too.
5. **Generate**, then **copy** the token and keep it handy. You won’t see it again.

---

## Step 2 — Log in from the Mac

Open **Terminal**. For this project the GitHub user is **`WileyOne`**:

```bash
docker login ghcr.io -u WileyOne
```

When it asks for **Password**, paste the **token** from Step 1.

---

## Step 3 — Build and upload

```bash
cd "/Users/dadewilson/Documents/Cursor/wilservice.us"

export IMAGE=ghcr.io/wileyone/wilservice.us:latest
docker build --platform linux/amd64 -t "$IMAGE" .
docker push "$IMAGE"
```

- **`linux/amd64`** — your TrueNAS server is Intel/AMD style; this line makes the package compatible even if your Mac is Apple Silicon.
- First run may take **several minutes**.

---

## Step 4 — TrueNAS

In **Apps** → **Custom App**:

- **Image:** `ghcr.io/wileyone/wilservice.us:latest`
- **Port:** host **8080** → container **80**.
- **No** extra disk mount for the website.

If the package is **private**, add registry **username + token** in the app so TrueNAS can **download** it.

---

## When you edit the site

Run **Step 3** again, then **restart** the app on TrueNAS (or save again so it pulls **latest**).

---

## Different path: no Docker

You can instead copy files to the NAS with **`deploy.sh`** and use **`nginx:alpine`** + a **folder mount**. That’s described in the TrueNAS repo: **`docs/deploy-wilservice-step-by-step.md`** → Appendix.
