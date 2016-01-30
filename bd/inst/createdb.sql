DROP TABLE USERS;

CREATE TABLE USERS
(
  userId			char(20),
  accessKeyId		char(20),
  secretAccessKey	char(50),
  region			char(09),
  PRIMARY KEY pk (userId)
);

INSERT INTO USERS (userId,accessKeyId,secretAccessKey,region) VALUES ('TEST','AKIAI2OVVYQLA2G4KHUA','SHOLgvCtFH8wIv+GUW/J+rbcX+fNOXxVJ6JVPMi/','eu-west-1');

DROP TABLE SPOT_PRICES;

CREATE TABLE SPOT_PRICES
(
  InstanceType          char(20),
  ProductDescription    char(50),
  SpotPrice		    	decimal(20,10),
  Timestamp		    	timestamp,
  AvailabilityZone	    char(10),
  PRIMARY KEY pk (InstanceType, AvailabilityZone, ProductDescription, Timestamp)
)
PARTITION BY KEY(InstanceType, AvailabilityZone, ProductDescription)
;

DROP VIEW SPOT_PRICES_HOUR;

CREATE VIEW SPOT_PRICES_HOUR AS (
SELECT InstanceType, ProductDescription, TO_DATE(Timestamp, 'YYYY-MM-DD HH') as TimestampHour, min(SpotPrice) as SpotPriceMin, max(SpotPrice) SpotPriceMax, avg(SpotPrice) SpotPriceAvg 
FROM SPOT_PRICES
group by InstanceType, ProductDescription, TO_DATE(Timestamp, 'YYYY-MM-DD HH')
);
