DROP TABLE IF EXISTS USERS;

CREATE TABLE `USERS` (
`accessKeyId` 			CHAR(20) 		NOT NULL,
`secretAccessKey` 		CHAR(50) 		NOT NULL,
`region` 				CHAR(9) 		NOT NULL,
`nombre` 				CHAR(200) 		NOT NULL COMMENT 'Nombre identificativo',
`login` 				CHAR(20) 		NOT NULL COMMENT 'Login en hiCloud',
`password` 				CHAR(20) 		NOT NULL COMMENT 'Passwd en hiCloud',
PRIMARY KEY (`login`)
);

INSERT INTO USERS (`accessKeyId`,`secretAccessKey`,`region`,`nombre`,`login`,`password`) VALUES ('XXXXX','XXXXXX','eu-west-1','HICLOUD_USER','HUSER','HPASSW');


DROP TABLE IF EXISTS SPOT_PRICES;

CREATE TABLE SPOT_PRICES (
`instanceType`          CHAR(20)		NOT NULL,
`productDescription`    CHAR(50)		NOT NULL,
`spotPrice`		    	DECIMAL(20,10) 	NOT NULL,
`spotPriceDate`	    	TIMESTAMP 		NOT NULL,
`availabilityZone`	    CHAR(20)		NOT NULL,
PRIMARY KEY pk (`instanceType`, `availabilityZone`, `productDescription`, `spotPriceDate`)
)
PARTITION BY KEY(`instanceType`, `availabilityZone`, `productDescription`)
;

DROP VIEW IF EXISTS SPOT_PRICES_HOUR;

CREATE VIEW SPOT_PRICES_HOUR AS (
SELECT instanceType, productDescription, STR_TO_DATE(spotPriceDate, '%Y-%m-%d %H') as spotPriceDateHour, min(spotPrice) as spotPriceMin, max(spotPrice) spotPriceMax, avg(spotPrice) spotPriceAvg 
FROM SPOT_PRICES
group by instanceType, productDescription, STR_TO_DATE(spotPriceDateHour, '%Y-%m-%d %H')
)


