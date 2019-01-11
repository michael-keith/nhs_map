import csv
import mysql.connector

mydb = mysql.connector.connect(
host="localhost",
user="root",
passwd="  ",
database="nhs"
)

cur = mydb.cursor()

with open('eu_ref.csv', 'rb') as csvfile:
    data = csv.reader(csvfile, delimiter=',', quotechar='"')
    firstline = True
    for row in data:
        if firstline:
            firstline = False
        else:
            print row[0]
            if row[5] > row[6]:
                vote = "remain"
            else:
                vote = "leave"
            sql = "INSERT INTO constits(name,vote,leave_perc,remain_perc) VALUES(%s,%s,%s,%s)"
            val = (row[0].replace(",",""), vote, row[6].replace("%",""), row[5].replace("%",""))
            cur.execute(sql, val)
            mydb.commit()
