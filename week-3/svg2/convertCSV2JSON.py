""""
Programm that converts a csv file to a json file.
The file retains its name, like this:
NAME.csv -> NAME.json

Guido Visser
10199187
"""
import csv
from json import dumps


def csv_to_json(filename):

    if not filename.endswith('.csv'):
        raise TypeError('File is no .csv file')

    # open the file in universal line ending mode
    with open(filename, 'rU') as infile:

        # read the file as a dictionary for each row ({header : value})
        reader = csv.DictReader(infile)

        # create a list of dictionaries for every row in csv file
        data = []
        for row in reader:
            item = {}
            for header, value in row.items():
                if header == "Country_Code" or header == "2013":
                    item[header] = value
            data.append(item)

    # write data to dictionary
    with open(filename[:-3] + 'json', "w") as outfile:
        outfile.write(dumps(data, outfile).encode('utf8'))


## ================================================================
## MAIN

csv_to_json('CO2 emission.csv')
