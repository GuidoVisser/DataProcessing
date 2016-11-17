#!/usr/bin/env python
# Name:
# Student number:
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv

from pattern.web import URL, DOM, plaintext, Element
import unicodedata

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'

# download HTML
url = URL(TARGET_URL)
dom = DOM(url.download(cached=True))

def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # list of HTML elements containing information about a series
    element_list = Element(dom).by_class("lister-item-content")

    # list of lists containing relevant information about series
    tvseries = []

    # list containing relevant information about series
    tvseries_item = []

    for element in element_list:

        # make sure tvseries_item resets at the start of each runthrough of the loop
        del tvseries_item
        tvseries_item = []

        # get titles
        title = plaintext(element('a')[0].content)
        title = unicodedata.normalize('NFKD', title).encode('ASCII', 'ignore')
        tvseries_item.append(title)

        # get ratings
        rating = plaintext(element('span.value')[0].content)
        rating = unicodedata.normalize('NFKD', rating).encode('ASCII', 'ignore')
        tvseries_item.append(rating)

        # get genres
        genre = plaintext(element('span.genre')[0].content)
        genre = unicodedata.normalize('NFKD', genre).encode('ASCII', 'ignore')
        tvseries_item.append(genre)

        # get actors
        actors_data = element('p > a')
        actors = ""
        for actor in actors_data:
            actors += actor.content + ", "
        actors = unicodedata.normalize('NFKD', actors[:-2]).encode('ASCII', 'ignore')
        tvseries_item.append(actors)

        # get runtimes
        runtime = plaintext(element('span.runtime')[0].content)
        runtime = unicodedata.normalize('NFKD', runtime[:-4]).encode('ASCII', 'ignore')
        tvseries_item.append(runtime)

        # add finished list item to list
        tvseries.append(tvseries_item)

    return tvseries


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # print each item in tvseries on a separate row in .csv file
    for element in tvseries:
       writer.writerow(element)

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)