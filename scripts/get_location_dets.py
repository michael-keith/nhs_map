# coding: utf-8
#!/usr/bin/python
from bs4 import BeautifulSoup
import urllib2
import requests
import json
import mysql.connector
import re
import time

mydb = mysql.connector.connect(
host="localhost",
user="root",
passwd="  ",
database="nhs"
)
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

cur = mydb.cursor(dictionary=True)
cur.execute("SELECT * FROM hospitals WHERE lat IS NULL")
hospitals = cur.fetchall()

for hospital in hospitals:
    lat = 0
    lon = 0

    try:
        json_url = "https://nominatim.openstreetmap.org/search/" + hospital["name"] + " " + hospital["address"] + "?format=json&polygon=1&addressdetails=1"
        print "(Trying: " + json_url + ")"
        response = requests.get(json_url, headers=headers)
        try:
            data = json.loads(response.content)
        except ValueError:
            print "JSON ERROR!"
        lat = data[0]["lat"]
        lon = data[0]["lon"]
        time.sleep(1)
    except IndexError:
        try:
            json_url = "https://nominatim.openstreetmap.org/search/" + hospital["postcode"] + "?format=json&polygon=1&addressdetails=1"
            print "(Trying: " + json_url + ")"
            response = requests.get(json_url, headers=headers)
            data = json.loads(response.content)
            lat = data[0]["lat"]
            lon = data[0]["lon"]
            time.sleep(2)
        except IndexError:
            try:
                json_url = "https://nominatim.openstreetmap.org/search/" + hospital["address"] + "?format=json&polygon=1&addressdetails=1"
                print "(Trying: " + json_url + ")"
                response = requests.get(json_url, headers=headers)
                data = json.loads(response.content)
                lat = data[0]["lat"]
                lon = data[0]["lon"]
                time.sleep(3)
            except IndexError:
                print "ERROR FINDING COORDS!"

    # Get constituency
    url = "https://constituencyfinder.digiminster.com/Search?searchTerm=" + hospital["postcode"]
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, features="html.parser")
    try:
        constit = soup.select("span.constituency")[0].text
    except IndexError:
        print "No postcode found!"

    try:
        sql = "UPDATE hospitals SET lat = %s, lon = %s, constituency = %s WHERE id = %s"
        val = (lat,lon,constit,hospital["id"])
        cur.execute(sql, val)
        mydb.commit()
    except mysql.connector.errors.DataError:
        print "MySQL error"
