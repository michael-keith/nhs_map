import csv
import mysql.connector

mydb = mysql.connector.connect(
host="localhost",
user="root",
passwd="  ",
database="nhs"
)

cur = mydb.cursor()

with open('nhs_eu_staff_data.csv', 'rb') as csvfile:
    data = csv.reader(csvfile, delimiter=',', quotechar='"')
    firstline = True
    for row in data:
        if firstline:
            firstline = False
        else:
            print row[1]
            sql = "INSERT INTO trusts(code,area,name,total_staff,eu_staff,eu_staff_perc,frontline_total,frontline_eu,frontline_perc,doctors_total,doctors_eu,doctors_perc,nurses_total,nurses_eu,nurses_perc,midwives_total,midwives_eu,midwives_perc) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            val = (row[0],row[2],row[1], row[3],row[4],row[5].replace("%",""), row[6],row[7],row[8].replace("%",""), row[9],row[10],row[11].replace("%",""), row[12],row[13],row[14].replace("%",""), row[15],row[16],row[17].replace("%","").replace("-","0"))
            cur.execute(sql, val)
            mydb.commit()
