#  
#   A Node.js server that temperature and humidity values from a log file.
#   Also uses Node static to serve static files
#
#   Ching Yiu Stephen Leung, 11 Feb 2015
#   Ref:https://github.com/talltom/PiThermServer
#   Ref:https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/overview
#

import os
import glob
import time
import Adafruit_DHT
import sys, traceback
from datetime import datetime

# minutes between each recording
interval = 5

#  Setup sensors
sensor = Adafruit_DHT.DHT22 
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')
 
device_dir = '/sys/bus/w1/devices/' #  device directory
device_folder = glob.glob(device_dir + '28*')[0] #  device folder
device_file = device_folder + '/w1_slave' #  device folder

#  Humidity sensor pin
pin = 10 

#  Database file
store_file = '/home/pi/tmph/tmp.txt'

#  Get the temperature from the temperature sensor
def getTmp():
    sourceFile = open(device_file, 'r')
    lines = sourceFile.readlines()
    sourceFile.close()

    if (lines[0].find('YES') != -1):
        tmpPos = lines[1].find('=')
        if (tmpPos != -1):
            tmpString = lines[1][tmpPos+1:]
            tmp = float(tmpString) / 1000.0

    try:
        tmp
        return (tmp)
    except NameError:
        raise RuntimeError("Temperture Sensor not available")

#  Get the temperature and humidity from the DHT sensor
def getHumidity():
    humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

    if humidity is not None and temperature is not None:
        return ("{:.1f}".format(temperature), "{:.1f}".format(humidity))
    else:
        raise RuntimeError("Humidity Sensor not available")

try:
    while True:
        storeFile = open(store_file, 'a')
        try:
            tmp = getTmp()
            htmp, hhumidity = getHumidity()
            storeFile.write(datetime.now().strftime('%d/%m/%Y %X'))
            storeFile.write(" ")
            storeFile.write(str(tmp))
            storeFile.write(" ")
            storeFile.write(str(htmp))
            storeFile.write(" ")
            storeFile.write(str(hhumidity))
            storeFile.write("\n")
            print(str(tmp) + " " + str(htmp) + " " + str(hhumidity) + " written to file")
        except RuntimeError as err:
            print err
        storeFile.close()
        time.sleep(interval*60)
except KeyboardInterrupt:
    print
    print "Bye"
except Exception:
    traceback.print_exc(file=sys.stdout)
