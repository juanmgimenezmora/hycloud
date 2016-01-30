var async = require('async');
var AWS;

var functions = require('./functions');
var db = require('./db');

var client;

var resultado=[];

if ( process.argv.length < 3 )
{
	console.log("Usage: node precios.js MilliSecondsBefore [ (InstanceType|All) (Zone|All) ] ");
        return;
}

console.log("[INFO] Comenzado la obtención de precios spot :: " + functions.getTimeStampStr());	

var date = new Date();
 
var startTime = new Date(date.getTime()+(date.getTimezoneOffset()*60000)-process.argv[2]);
var instanceType = process.argv[3];
var AvailabilityZone =  process.argv[4];

console.log("[INFO] Fecha inicio de los cambios de precios :: " + startTime);

db.obtenerCredenciales('HUSER', function() {findRegions();});

var findRegions = function()
{
	AWS = db.dbaws;
	client = db.client;

	var ec2 = new AWS.EC2();
	var asyncTasks = [];

	console.log("[INFO] Obteniendo regiones disponibles en aws");
  
	ec2.describeRegions(function(error, data)
	{
                if (error) ferror(error);

		var regions = data.Regions;		

		regions.forEach(function(region) 
		{
			var params = {};
			params.regionName = region.RegionName;

			if ( instanceType != null && instanceType != "" && instanceType != "All" )
       			{
                        	params.instanceTypes=[instanceType];
			}

			if ( AvailabilityZone != null && AvailabilityZone != "" && AvailabilityZone != "All" )
       			{
                        	params.AvailabilityZone=AvailabilityZone;
			}

		 	params.StartTime = new Date(startTime);
			params.EndTime = new Date();

			asyncTasks.push(function(callback){findSpotPricesByRegion(params,callback);});
		});
		
		async.series(asyncTasks,function(err) 
		{
			if (err) ferror(error)
			else fOk();
		});
	});
}

var findSpotPricesByRegion = function(params, callback)
{
    AWS.config.region = params.regionName;

    console.log('Procesando la peticion : ' + JSON.stringify(params));

    var ec2 = new AWS.EC2();
    
    AWS.config.region = params.regionName;
    delete params.regionName;

    ec2.describeSpotPriceHistory(params,function(error, data)
        {

            if (error)  ferror(error);

            if ( data != null )
            {
       		resultado.push(data.SpotPriceHistory);
                almacenarResultado(data);
                console.log("Recuperados " + data.SpotPriceHistory.length + " registros");
		if (data.NextToken != null && data.NextToken !="" )
			{
				params.NextToken  = data.NextToken;
                                params.regionName = AWS.config.region; 
				findSpotPricesByRegion( params );
			}
		}
                if ( callback != null )  callback();       
        });

}

var almacenarResultado = function(data)
{
	var resultadoRegion=[];	

	var prepared = client.prepare('INSERT IGNORE INTO SPOT_PRICES(instanceType, productDescription, spotPrice, spotPriceDate, availabilityZone) VALUES (:i1,:i2,:i3,:i4,:i5)');

	var spotPriceHistory = data.SpotPriceHistory;

	for ( i=0; i < spotPriceHistory.length; i++)
	{
        var row = spotPriceHistory[i];
        var tiempo = functions.getTimeStampDate(new Date(row.Timestamp));

        //console.log("[INFO]  Insertando los datos en SPOT_PRICES " + JSON.stringify(row));

        client.query(prepared({ i1:row.InstanceType, i2: row.ProductDescription, i3: row.SpotPrice, i4: tiempo.toISOString().replace(/T/, ' ').replace(/\..+/, ''), i5: row.AvailabilityZone}), function(err)
            {
		if (err) console.log("[ERROR] Insertando los datos en SPOT_PRICES DESC: " + err);
            });
	}
}

function fOk()
{
        db.DB_release();
	//console.log(JSON.stringify(resultado));
	console.log("[INFO] Finalizando la obtención de precios spot :: " + functions.getTimeStampStr());	
}

var ferror = function(error)
{
	client.end();
	console.log("[ERROR]" + error); // an error occurred
}
