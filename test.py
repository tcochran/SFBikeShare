import csv
import itertools
import pprint
import time
import json
pp = pprint.PrettyPrinter(indent=4)

with open('app/data/201402_trip_data.csv', 'rb') as csvfile:

    spamreader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    
    stations = ['21', '22', '23', '24', '25', '26']
    def findRedwood(row):
        if ((row['Start Terminal'] in stations or row['End Terminal'] in stations) and (row["Start Date"].startswith('1/21/2014') or row["End Date"].startswith('1/21/2014'))):
            return True
        else:
            return False




    rows = filter(findRedwood, spamreader)
    print len(rows)
    pp.pprint(rows)


