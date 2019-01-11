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

cur = mydb.cursor()

url = "https://www.nhs.uk/servicedirectories/pages/nhstrustlisting.aspx"
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

response = requests.get(url, headers=headers)

soup = BeautifulSoup(response.content, features="html.parser")

trusts = soup.select("a[href*=Services]")

for trust in trusts:
    print trust.text

    url = "https://www.nhs.uk/" + trust['href'].replace('Overview', 'HospitalsAndClinics')
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, features="html.parser")

    hospital_boxes = soup.select("div.box")

    for hospital_box in hospital_boxes:
        try:
            hospital_url = "https://www.nhs.uk/" + hospital_box.select("h3")[0].select("a")[0]["href"]
            response = requests.get(hospital_url, headers=headers)
            soup = BeautifulSoup(response.content, features="html.parser")

            trust_name_raw = hospital_postcode = re.findall(r'Information supplied by(.+)', response.text)
            trust_name = BeautifulSoup(trust_name_raw[0], features="html.parser").text
            print trust_name
        except IndexError:
            print "-"

        hospital_name = hospital_box.select("h3")[0].text
        hospital_address = BeautifulSoup(str( hospital_box.select("dd.addrss")[0] ).replace("<br/>", " "), features="html.parser").text

        hospital_postcode = re.findall(r'[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}', hospital_address)
        try:
            hospital_postcode = hospital_postcode[0]
        except IndexError:
            hospital_postcode = ["null"]

        hospital_links = hospital_box.select("a[href*=Services]")

        type = "Other Service"
        for link in hospital_links:
            if "hospitals" in link['href']:
                type = "Hospital"
            elif "clinics" in link['href']:
                type = "Clinic"

            try:
                sql = "INSERT INTO hospitals(trust, name, type, address, postcode) VALUES(%s, %s, %s, %s, %s)"
                val = (trust_name, hospital_name, type, hospital_address, hospital_postcode)
                cur.execute(sql, val)
                mydb.commit()
            except mysql.connector.errors.ProgrammingError:
                print "MySQL error"


            print "---" + type + " -- " + hospital_name
