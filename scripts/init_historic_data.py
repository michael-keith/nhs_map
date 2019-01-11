import csv
import mysql.connector

mydb = mysql.connector.connect(
host="localhost",
user="root",
passwd="  ",
database="nhs"
)

cur = mydb.cursor()

with open('historic_staff_data.csv', 'rb') as csvfile:
    data = csv.reader(csvfile, delimiter=',', quotechar='"')
    firstline = True
    for row in data:
        if firstline:
            firstline = False
        else:
            sql = "INSERT INTO historic(code,date,name,type,total) VALUES(%s,%s,%s,%s,%s)"
            val = (row[1], row[0], row[2], row[3], row[4])
            cur.execute(sql, val)
            mydb.commit()
