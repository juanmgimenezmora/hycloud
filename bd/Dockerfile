FROM mariadb:10.0
# replace this with your application's default port
EXPOSE 3306
VOLUME /usr/src/app/instVol
WORKDIR /usr/src/app
ADD ./instVol/* /usr/src/app/inst/
CMD ./inst/DockerFileCmd.sh
