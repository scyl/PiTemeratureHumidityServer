#  
#   A Pythoin program that create database for logging the temperature and humidity from a DS18B20 and DHT22 sensor
#   
#   Ching Yiu Stephen Leung, 11 Feb 2015
#   Ref:https://github.com/talltom/PiThermServer
#   Ref:https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/overview
#

import sqlite3 as sql
import sys

connection = None

try:
    connection = sql.connect('log.db')
    cursor = connection.cursor()
    cursor.execute("CREATE TABLE temperature_records(unix_time bigint primary key, celsius1 real, celsius2 real, humidity real);")
    connection.commit()
except sql.Error, e:
    if connection:
        connection.rollback()
    print "Error %s:" % e.args[0]
    sys.exit(1)
finally:
    if connection:
        connection.close()