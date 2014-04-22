import csv
import itertools
import pprint
import time
import json

with open('app/data/201402_rebalancing_data.csv', 'rb') as csvfile:
    spamreader = csv.DictReader(csvfile, delimiter=',', quotechar='"')

    pp = pprint.PrettyPrinter(indent=2, depth=3)

    days = {}
    # items = itertools.islice(spamreader, 500000)
    for item in spamreader:
        date = time.strptime(item['time'], "%Y/%m/%d %H:%M:%S")
        datestring = time.strftime('%x', date)

        if (days.get(datestring) == None):
            days[datestring] = []
        days[datestring].append(item)

keys = days.keys()

def reduceRebalances(list, item):
    if not list:
        previous = None
        return [item]
    else:
        previous = list[-1]

    if (previous['docks_available'] != item['docks_available'] or previous['bikes_available'] != item['bikes_available'] or previous['station_id'] != item['station_id']):
        list.append(item)
    return list

for date in keys:
    rebalances = days[date]
    uniqueRebalances = reduce(reduceRebalances, rebalances, [])
    print len(uniqueRebalances)

    with open('app/data/rebalancing/%s.json' % date.replace("/", "_"), 'w') as outfile:
        print 'app/data/rebalancing/%s.json' % date.replace("/", "_")
        json.dump(uniqueRebalances, outfile)

    
        