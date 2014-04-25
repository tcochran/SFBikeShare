import csv
import itertools
import pprint
import time
import json

with open('app/data/201402_trip_data.csv', 'rb') as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')

    days = {}
    for item in reader:
        date = time.strptime(item['Start Date'], "%m/%d/%Y %H:%M")
        datestring = time.strftime('%x', date)

        if (days.get(datestring) == None):
            days[datestring] = []
        days[datestring].append(item)

keys = days.keys()

dates = []
for date in keys:
    trips = days[date]

    # with open('app/data/trips/%s.json' % date.replace("/", "_"), 'w') as outfile:
    #     json.dump(trips, outfile)

    dates.append(date)

with open('app/data/all_dates.json', 'w') as outfile:
        json.dump(dates, outfile)
