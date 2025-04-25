FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npx playwright install --with-deps
CMD ["npx", "framework", "run"]