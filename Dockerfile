FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/trashtracker/browser/ /usr/share/nginx/html/

EXPOSE 8080
