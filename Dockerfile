# --------- Build Stage ---------
    FROM node:20 AS builder

    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build --prod
    
    # --------- NGINX Stage ---------
    FROM nginx:alpine
    
    # revove default nginx index page
    RUN rm -rf /usr/share/nginx/html/*
    
    # copy build files from builder stage
    COPY --from=builder /app/dist/join_angular/browser /usr/share/nginx/html

    
    # optional: copy custom nginx config file
    # COPY nginx.conf /etc/nginx/nginx.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    