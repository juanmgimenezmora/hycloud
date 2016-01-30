#!/bin/bash

echo '****************************************************'
echo ' INCIANDO BDD '
echo '****************************************************'

cmd="/docker-entrypoint.sh mysqld";
$cmd &

#rm -f /var/lib/mysql/innovation/creado.txt

if [ ! -f '/var/lib/mysql/innovation/creado.txt' ]
then
echo '***************************************************************************'
echo ' SE NECESITA CREAR ESQUEMA INICIAL. ESPERANDO A QUE LA BBDD ESTE OPERATIVA '
echo '***************************************************************************'

sleep 5

status=$(mysqladmin -u $MYSQL_USER -p$MYSQL_PASSWORD status 2>/dev/null | grep "Uptime");

while [ "$status" == "" ]
do
sleep 5;
status=$(mysqladmin -u $MYSQL_USER -p$MYSQL_PASSWORD status 2>/dev/null | grep "Uptime");
done

echo '****************************************************'
echo ' CREANDO ESQUEMA INICIAL '
echo '****************************************************'

   $(mysql innovation -u $MYSQL_USER -p$MYSQL_PASSWORD < ./inst/createdb.sql)
fi

touch /var/lib/mysql/innovation/creado.txt

echo '**************************************************'
echo 'FIN ::: Proceso de arranque finalizado';
echo '**************************************************'

while ( true ) 
do
	sleep 20000;
done

