# Hotel Dyje (hoteldyje.cz): statický web na nginx.
# Coolify: build pack Dockerfile, base directory /hotel-dyje, port 80.
# Konfigurace nginx je v nginx.conf vedle (hlavičky, CSP, 301 ze starých URL).
FROM nginx:alpine

COPY . /usr/share/nginx/html/

RUN mv /usr/share/nginx/html/nginx.conf /etc/nginx/conf.d/default.conf \
 && rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/docker-compose.yaml /usr/share/nginx/html/.env \
 && nginx -t
