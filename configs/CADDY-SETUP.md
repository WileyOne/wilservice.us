# Caddy setup for wilservice.us

## Common errors and fixes

### 1. "failed to get certificate" / "automatic HTTPS" errors
**Cause:** You're using the **domain** block (`wilservice.us, www.wilservice.us`) but the domain doesn't point to this server's IP, or port 80/443 isn't reachable from the internet.

**Fix:** Use the **IP-only** block instead. In `Caddyfile`, use only:
```
:80 {
    root * /var/www/wilservice.us
    try_files {path} /index.html
    file_server
    encode gzip
}
```
Remove or comment out the `wilservice.us, www.wilservice.us { ... }` block. Reload: `sudo systemctl reload caddy`.

---

### 2. "open ... no such file or directory" / "root path not found"
**Cause:** The directory in `root *` doesn't exist on the server.

**Fix:** Create it and deploy the site:
```bash
sudo mkdir -p /var/www/wilservice.us
sudo chown admdade:admdade /var/www/wilservice.us
```
Then from your Mac run `./deploy.sh` so files are in that folder.

---

### 3. "directive ... is not a valid directive"
**Cause:** Typo or wrong Caddy version. The config uses Caddy 2.x syntax.

**Fix:** Check version: `caddy version`. Directive order in the block must be:
1. `root * /path`
2. `try_files {path} /index.html`
3. `file_server`
4. `encode gzip`

---

### 4. "address already in use" / "bind: permission denied"
**Cause:** Port 80 is in use by another app (e.g. nginx, Apache), or Caddy is running without permission to bind to 80.

**Fix:** Stop the other server (`sudo systemctl stop nginx`) or run Caddy with sudo. If using a non-privileged port (e.g. 8080), use `:8080` in the Caddyfile and open that port in the firewall.

---

## Steps on the server

1. **Install Caddy** (if not already):
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```

2. **Create site directory:**
   ```bash
   sudo mkdir -p /var/www/wilservice.us
   sudo chown admdade:admdade /var/www/wilservice.us
   ```

3. **Copy Caddyfile** (from your Mac, from project root):
   ```bash
   scp configs/Caddyfile.example admdade@10.7.5.253:/tmp/Caddyfile
   ```
   Then on the server:
   ```bash
   sudo mv /tmp/Caddyfile /etc/caddy/Caddyfile
   ```

4. **Edit if needed:** Use Option A (":80") for LAN/IP access; use Option B (domain) only when DNS points to this server.

5. **Reload Caddy:**
   ```bash
   sudo systemctl reload caddy
   sudo systemctl status caddy
   ```

6. **Deploy site from Mac:** `./deploy.sh`

Then open http://10.7.5.253 in a browser.
