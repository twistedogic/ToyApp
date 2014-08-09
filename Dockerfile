FROM dockerfile/nodejs
MAINTAINER twistedogic

RUN apt-get update -y && apt-get install -y git
RUN git clone https://github.com/twistedogic/ToyApp.git /src
RUN cd /src && npm install
CMD ["node", "/src/app.js"]
