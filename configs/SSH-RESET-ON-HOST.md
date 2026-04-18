# What might have broken SSH, and how to reset it on the host

You only ran what was recommended: **ssh-copy-id from your Mac** (which adds your key to the server’s `~/.ssh/authorized_keys`) and possibly **Caddy/server setup** (mkdir/chown for `/var/www`, Caddyfile). None of that should change `sshd_config` or disable logins. Here’s what could still have gone wrong and how to fix it.

---

## Likely causes (from what we changed)

1. **Permissions on `~/.ssh` or `authorized_keys`**  
   `sshd` will **ignore** `authorized_keys` if:
   - `~/.ssh` is not `700` (drwx------)
   - `~/.ssh/authorized_keys` is not `600` (-rw-------)
   - `~` (home) is group- or world-writable  

   If anything (e.g. a mistaken `chmod` or `chown` in the wrong directory) changed those, key login stops working. Password login can still work if it’s enabled.

2. **`authorized_keys` corrupted**  
   Rare, but if the file was edited and a line was broken (missing newline, half a line), that key won’t work. Other lines would still work.

3. **Password authentication disabled**  
   We didn’t suggest changing this. If it was already set to `PasswordAuthentication no` and the only way in was your key, then once the key stops working (e.g. due to permissions above), you’re locked out until you fix it from console.

4. **Firewall (UFW)**  
   We only said to *check* and “make sure port 22 is allowed.” If you ran `ufw enable` without `ufw allow 22` first, or a rule was removed, SSH could be blocked.

You need **another way onto the server** to fix this: physical console, IPMI, another user that can SSH in, or a machine on the same LAN that still has access.

---

## Reset SSH on the host (run these on the server)

Use **console** (monitor + keyboard), **IPMI**, or **SSH from another machine** that can still log in. Then run the following as `admdade` (or as root where noted).

### 1. Fix permissions (most important)

```bash
# As admdade (or the user you log in as)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 755 ~
```

If `~/.ssh` or `authorized_keys` is missing (you deleted it by mistake), recreate:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Then paste your Mac's public key into authorized_keys (see step 3)
```

### 2. Put your Mac's key in authorized_keys

On your **Mac**, run:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the **entire line** (starts with `ssh-ed25519`).

On the **server**, run:

```bash
cat ~/.ssh/authorized_keys
```

You should see that same line. If not, append it:

```bash
# Replace the line below with the output of 'cat ~/.ssh/id_ed25519.pub' from your Mac
echo 'PASTE_THE_FULL_LINE_HERE' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Allow password logins (temporary, so you can get in if key fails again)

```bash
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
echo "PasswordAuthentication yes" | sudo tee -a /etc/ssh/sshd_config
sudo sshd -t
```

If `sshd -t` says "Permission denied" or config error, fix the line (see step 4). Otherwise restart SSH:

```bash
sudo systemctl restart ssh
# or
sudo systemctl restart sshd
```

Try from your Mac: `ssh admdade@10.7.5.253` (key should work; if not, try with password).

### 4. If you edited sshd_config, verify it

```bash
sudo cat /etc/ssh/sshd_config
```

Check for:

- `PasswordAuthentication yes` (so you can fall back to password).
- No typos (e.g. `PermitRootLogin` spelled correctly).
- No duplicate, conflicting lines.

Test config:

```bash
sudo sshd -t
```

If it prints nothing, config is OK. Then:

```bash
sudo systemctl restart ssh
```

### 5. Firewall (if you use UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw reload
sudo ufw status
```

Check that port 22 is allowed.

---

## Quick reset (copy-paste on the server)

Run as **admdade** (or the user you use to SSH):

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 755 ~
sudo systemctl restart ssh
```

If SSH service name is `sshd`:

```bash
sudo systemctl restart sshd
```

Then from your Mac: `ssh admdade@10.7.5.253`.

---

## If you have no other access

- **Physical / console:** Reboot, use recovery or single-user mode if needed, then fix `~/.ssh` permissions and `authorized_keys` (and optionally enable password auth) as above.
- **Same LAN, another computer:** If that machine can still SSH to 10.7.5.253, use it to run the same commands on the server.
- **Backup of authorized_keys:** If you have a backup of `~/.ssh/authorized_keys` from when it worked, restore it and set `chmod 600 ~/.ssh/authorized_keys`.

After reset, test from your Mac: `ssh -v admdade@10.7.5.253` to confirm key or password login works.
