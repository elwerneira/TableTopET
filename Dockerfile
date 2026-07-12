FROM node:26-alpine3.23 AS builder

COPY package.json package-lock.json tsconfig.json tsconfig.app.json angular.json /build/
WORKDIR /build
RUN npm install
COPY src /build/src
RUN npm run build
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist/TableTopET/browser /usr/share/nginx/html
COPY public/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

