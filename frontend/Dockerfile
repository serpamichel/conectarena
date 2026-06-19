FROM node:20-alpine AS build
WORKDIR /app

COPY figma/package*.json ./figma/
WORKDIR /app/figma
RUN npm ci

COPY figma/ .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/figma/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]