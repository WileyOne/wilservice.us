# Static site in nginx. Build for TrueNAS (amd64), e.g.:
#   docker build --platform linux/amd64 -t ghcr.io/wileyone/wilservice.us:latest .
# See PUBLISH-IMAGE.md
FROM nginx:alpine
COPY . /usr/share/nginx/html/
