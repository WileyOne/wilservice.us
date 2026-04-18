# wilservice.us

IT support site for small businesses and home users: computer repair, lessons, network management, security, identity, and personal security (passwords, online safety, trusted assistant).

## Contents

- **index.html**: Single-page site: hero, services, why us, contact form
- **styles.css**: Modern layout, teal accent, responsive (mobile nav)
- **main.js**: Mobile menu toggle, footer year, contact form (mailto)

## Edit before going live

1. **Contact form**: The form opens the user's mail client (mailto) with the message pre-filled. To use a form service instead (e.g. Formspree, Netlify Forms), set the form `action` and `method` and replace the submit handler in `main.js` with a `fetch()` call.

## Run locally

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then open http://localhost:8000

## Deploy on TrueNAS (container)

The site can run as a **Docker image** (`Dockerfile` + `nginx:alpine`) with no bind-mounted HTML on the NAS. Build/push from your Mac, then run the image in TrueNAS **Apps**. See **`PUBLISH-IMAGE.md`** and the TrueNAS repo **`docs/deploy-wilservice-step-by-step.md`**.
