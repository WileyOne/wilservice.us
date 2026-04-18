# SSH not working from Mac to 10.7.5.253

Run these on your **Mac** in Terminal. They help narrow down why SSH stopped working.

---

## 1. Can you reach the server at all?

```bash
ping -c 3 10.7.5.253
```

- **No reply (request timeout):** Your Mac can’t reach that IP. Common causes:
  - You’re on a different network (e.g. different Wi‑Fi, away from home).
  - Server is off, unplugged, or rebooted.
  - Router/network changed (DHCP gave the server a new IP).
  - Firewall or VLAN blocking traffic.
- **Replies:** Network path is fine; problem is likely SSH or port 22. Go to step 2.

---

## 2. Is port 22 (SSH) open?

```bash
nc -zv -w 5 10.7.5.253 22
```

- **"Connection refused" or no output / timeout:** Nothing is listening on 22, or a firewall is blocking it. On the server (if you have another way in): check `sudo systemctl status ssh` and that port 22 is allowed (e.g. `sudo ufw status` if using UFW).
- **"succeeded" or "open":** Port is open. Go to step 3.

---

## 3. Did the server’s IP change?

10.7.5.253 is a private address. If your router or server was reset, the server might have a new IP.

- Check your router’s DHCP client list or admin page for the hostname (e.g. webhost01) and its current IP.
- If the IP changed, use the new one: `ssh admdade@NEW_IP`, and update `deploy.sh` (DEPLOY_HOST) and any SSH config.

---

## 4. Try SSH with verbose output

```bash
ssh -v admdade@10.7.5.253
```

- **"Connection timed out"** before any key exchange → still a network/firewall issue (steps 1–2).
- **"Permission denied (publickey,password)"** → Server is reachable; auth is failing. Your Mac’s key might not be in `~/.ssh/` anymore, or the server’s `authorized_keys` was changed. Re-copy your key from the Mac:  
  `ssh-copy-id -i ~/.ssh/id_ed25519.pub admdade@10.7.5.253`  
  (You’ll need password auth enabled on the server for that one time.)

---

## 5. If you have another way onto the server

(Physical access, console, or SSH from another machine on the same LAN.)

**Check SSH service:**
```bash
sudo systemctl status ssh
# or
sudo systemctl status sshd
```
If it’s not active: `sudo systemctl start ssh` and `sudo systemctl enable ssh`.

**Check firewall (example: UFW):**
```bash
sudo ufw status
```
Check port 22 is allowed. If not: `sudo ufw allow 22` then `sudo ufw reload`.

**Check that your Mac’s key is still there:**
```bash
cat ~/.ssh/authorized_keys
```
Your key (starts with `ssh-ed25519` or `ssh-rsa`) should be listed. If it was removed, add it again (from your Mac: `cat ~/.ssh/id_ed25519.pub` and append that line to the server’s `~/.ssh/authorized_keys`).

---

## Quick checklist

| Check | Command / action |
|-------|-------------------|
| Reachability | `ping -c 3 10.7.5.253` |
| Port 22 open | `nc -zv -w 5 10.7.5.253 22` |
| Same network? | Same Wi‑Fi/VPN as when it worked? |
| IP changed? | Router DHCP list / admin page |
| SSH auth | `ssh -v admdade@10.7.5.253` → timeout vs permission denied |
| Server: SSH running | `sudo systemctl status ssh` |
| Server: firewall | `sudo ufw status` (or equivalent) |

Most “it worked, now it doesn’t” cases with a 10.x address are **network** (different Wi‑Fi, server off, or IP change). Start with **ping** and **nc** on your Mac; that tells you whether to focus on network or SSH/auth.
