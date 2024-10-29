FROM node:20-alpine
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm install -g npm@latest
RUN npm i express cors dotenv express-validator @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome

RUN npm install react-bootstrap bootstrap
