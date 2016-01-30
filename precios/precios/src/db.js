var AWS = require('aws-sdk');
var Client = require('mariasql');
var client;
var dbaws;

var DB_connect = function()
{
    client = new Client();
    client.connect
       	(
		{
			host: 'bd',
			user: 'mysql',
			password: 'mysqlpwd',
			db: 'innovation'
		}
	);
	
	client.on('connect', function()    {console.log('Client connected');}
	).on('error',   function(err)      {console.log('Client error: ' + err);}
	).on('close',   function(hadError) {console.log('Client closed');});
}

exports.DB_release = function()
{
  setTimeout(function() { client.end(); } , 30);
}

exports.obtenerCredenciales = function(usuario, callback)
{
    DB_connect();

    exports.client=client;
	
    var prepared= client.prepare('SELECT accessKeyId, secretAccessKey, region FROM USERS WHERE login = :id');
	
    client.query(prepared({ id: usuario }), function(err, rows) 
	{
		if (err)
		{
			console.log('[ERROR] Error al obtener las credenciales para el usuario ' + usuario);
			throw err;
		}
           
                if (rows.length == 0)
		{
			console.log('[ERROR] No se han encontrado credenciales para el usuario ' + usuario);
			throw err;	
		}
			
		// Solo deberia tener un resultado	
        var row = rows[0];
	AWS.config = new AWS.Config({accessKeyId: row.accessKeyId, secretAccessKey: row.secretAccessKey, region: row.region});
        exports.dbaws=AWS;
        callback();
	});
}
