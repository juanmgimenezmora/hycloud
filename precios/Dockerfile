FROM node
EXPOSE 8080
ADD ./precios/ /usr/src/app/precios/
WORKDIR /usr/src/app/precios
CMD node ./src/precios.js $PRECIOS_MILLISECONDS
