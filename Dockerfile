FROM node:12
RUN npm install
COPY . .
EXPOSE 5000
EXPOSE 3000
RUN npm run dev