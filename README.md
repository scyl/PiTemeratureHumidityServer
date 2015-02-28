PiTemeratureHumidityServer
==========================

Simple NodeJS server and logger for the DS18B20 digital temperature sensor and DHT22 humidity sensor on the Raspberry Pi.

Description
-----------
A NodeJS server for the DS18B20 GPIO temperature sensor and DHT22 humidity sensor on the Raspberry Pi. The DS18B20 sensor is accessed using the w1-gpio and w1-therm kernel modules in the Raspbian distro. The DHT22 sensor is accessed using Adafruit's Python DHT library. The server parses data from the sensors and returns the temperatures, humidity and a Unix time-stamp in JSON format, this is then written to a text file on the Pi. A simple front-end is included and served using node-static, which performs ajax calls to the server and plots temperature/humidity from a time-series, using the highcharts JavaScript library.

Files
-----
* tmpServer.js - NodeJS server, returns temperature and humidity as JSON, and serves other static files
* tmpLogger.py - Python program to record the temperature and humidity to the log
* tmpChart.html - Web page with that plot the last 48hrs of temperature and humidity

Dependencies
------------
* NodeJS
* node-static
* Adafruit_Python_DHT (https://github.com/adafruit/Adafruit_Python_DHT)

Install/Setup
-------------
1. Install node-static in the folder
2. Update tmpLogger.py with your desire location of the log file
3. Run tmpLogger.py
4. Update tmpServer.js with the location of the log file
5. Run tmpServer.js

References
----------
http://www.cl.cam.ac.uk/freshers/raspberrypi/tutorials/temperature/
http://tomholderness.wordpress.com/2013/01/03/raspberry-pi-temperature-server/
https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/overview
https://learn.adafruit.com/dht-humidity-sensing-on-raspberry-pi-with-gdocs-logging/overview
