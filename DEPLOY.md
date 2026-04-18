# Deploying wilservice.us to a Linux server

Deploying from Cursor to a locally hosted Linux server.

---

## Recommended stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Web server** | **Nginx** or **Caddy** | Both serve static files very well. Nginx: most common, tons of docs. Caddy: automatic HTTPS, simpler config. |
| **Deploy method** | **rsync** | One command from your machine (or Cursor terminal) to the server. No build step; only changed files are copied. |
| **Site directory** | e.g. `/var/www/wilservice.us` | Standard location; your server config points here. |

No database, no app server, no Node/Python on the server. Just the web server serving HTML/CSS/JS.

---

## One-time server setup

### 1. Install Nginx (or Caddy)

**Nginx (Debian/Ubuntu):**
```bash
sudo apt update && sudo apt install -y nginx
sudo systemctl enable nginx
```

**Caddy (auto HTTPS, simple config):**
```bash
sudo apt install -y debian-keyring debian-archive-keyring curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
sudo systemctl enable caddy
```

### 2. Create site directory and set permissions

```bash
sudo mkdir -p /var/www/wilservice.us
sudo chown -R "$USER:$USER" /var/www/wilservice.us
```

### 3. Web server config

- **Nginx:** Copy `configs/nginx-wilservice.conf` to `/etc/nginx/sites-available/wilservice.us`, edit `server_name` and `root` if needed, then:
  ```bash
  sudo ln -s /etc/nginx/sites-available/wilservice.us /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  ```
- **Caddy:** Copy `configs/Caddyfile.example` to your Caddy config, set your domain or IP, then:
  ```bash
  sudo systemctl reload caddy
  ```

---

## Deploy from Cursor (or your machine)

1. Edit the variables at the top of `deploy.sh`: your server user, host (IP or hostname), and remote path.
2. Check you can SSH to the server (`ssh user@host`).
3. From the project root (e.g. `Cursor/wilservice.us`), run:

```bash
./deploy.sh
```

Or from Cursor’s terminal:

```bash
cd "/Users/dadewilson/Documents/Cursor/wilservice.us" && ./deploy.sh
```

This **rsyncs** only changed files to the server. No build step; repeat anytime you want to publish updates.

---

## Optional: run deploy from Cursor with a shortcut

- **Tasks:** In Cursor, add a task in `.vscode/tasks.json` that runs `./deploy.sh` so you can Run Task to deploy.
- **Script:** You can also add an npm script in `package.json` (e.g. `"deploy": "./deploy.sh"`) and run `npm run deploy` from the terminal.

---

## Summary

- **Stack:** Nginx or Caddy + rsync. Static only; no extra runtime on the server.
- **Deploy:** Run `./deploy.sh` from the project in Cursor (or your machine) after editing the script’s server/path.
- **Reliability:** rsync is incremental and idempotent; Nginx/Caddy are stable and widely used for static hosting.
