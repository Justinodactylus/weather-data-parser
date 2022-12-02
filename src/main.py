import urllib
import os
from webbrowser import open_new
import requests
import csv
import argparse
from bs4 import BeautifulSoup

HOURLY_URL='https://www.ncei.noaa.gov/pub/data/uscrn/products/hourly02/'
DAILY_URL='https://www.ncei.noaa.gov/pub/data/uscrn/products/daily01/'
MONTHLY_URL='https://www.ncei.noaa.gov/pub/data/uscrn/products/monthly01/'

def cliArgumentParser():
    argParser = argparse.ArgumentParser(description='A parser to collect weather data and converts it into a XML schema.')
    argParser.add_argument("-t", "--time-intervall", type=str, choices=["hourly", "daily", "monthly"], required=True)
    argParser.add_argument("-y", "--year", type=int, required=False)
    argParser.add_argument("-l", "--location", type=str, help="The state location vector from the stations.tsv file.", required=True)

    return argParser.parse_args()

def getUrlPaths(url, ext='', params={}):
    response = requests.get(url, params=params)

    if response.ok:
        responseText = response.text
    else:
        return response.raise_for_status()
    
    soup = BeautifulSoup(responseText, 'html.parser')
    parent = [str(url + node.get('href')) for node in soup.find_all('a') if node.get('href').endswith(ext)]

    return parent

def getUrl(time='hourly', year=2022, location_vector='3S', ext='.txt'):
    stations = dict()
    with open("resources/stations.tsv") as tsv_file:
        stations_reader = csv.reader(tsv_file, delimiter="\t")

        station_vector_list = []
        for list in stations_reader:
            station_vector_list.append(list[4].replace(' ', '_')) # gets all state location vectors from stations.tsv and replace all spaces with '_' 

        intervallUrl = None
        finalUrl = None
        match time:
            case "hourly": intervallUrl = HOURLY_URL
            case "daily": intervallUrl = DAILY_URL
            case "monthly": 
                intervallUrl = MONTHLY_URL
                finalUrl = getPaths(intervallUrl, ext, location_vector + ext)
            case _: return None

        yearUrl = getPaths(intervallUrl, '/', str(year) + '/')
        finalUrl = getPaths(yearUrl, ext, location_vector + ext)
        return finalUrl

def getPaths(url: str, ext: str, endsWith: str):
    urlList = getUrlPaths(url, ext)
    for ur in urlList:
        if (ur.endswith(endsWith)):
            return ur
    raise Exception("No path '" + url + endsWith + "' found.") 

def main():
    args = cliArgumentParser()
    getUrl(time=args.time_intervall, year=args.year, location_vector=args.location, ext='.txt')

if __name__ == "__main__":
    main()