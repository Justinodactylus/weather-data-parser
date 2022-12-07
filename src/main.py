import ftplib
import urllib.request
import csv
import argparse

HOSTNAME='ftp.ncdc.noaa.gov'
HOURLY_PATH='/pub/data/uscrn/products/hourly02/'
DAILY_PATH='/pub/data/uscrn/products/daily01/'
MONTHLY_PATH='/pub/data/uscrn/products/monthly01/'
CREDENTIALS = ["ftp", "tomiger450\@dmonies.com"] # random email

def cliArgumentParser():
    argParser = argparse.ArgumentParser(description='A parser to collect weather data and converts it into a XML schema.')
    argParser.add_argument("-t", "--time-intervall", type=str, choices=["hourly", "daily", "monthly"], required=True)
    argParser.add_argument("-y", "--year", type=int, required=False)
    argParser.add_argument("-l", "--location", type=str, help="The state location vector from the stations.tsv file.", required=True)

    return argParser.parse_args()

def getUrlPaths(url: str, path: str, credentials: list):
    f = ftplib.FTP(url)
    f.login(credentials[0], credentials[1])
    f.cwd(path)
    ls = []
    f.retrlines('MLSD', ls.append)
    #callback=lambda line: ls.append(str(line).rpartition(';')[2].removeprefix(' ')))
    return ls

def getUrl(time=None, year=None, location_vector=None, ext=None):
    stations = dict()
    with open("resources/stations.tsv") as tsv_file:
        stations_reader = csv.reader(tsv_file, delimiter="\t")

        station_vector_list = []
        for list in stations_reader:
            station_vector_list.append(list[4].replace(' ', '_')) # gets all state location vectors from stations.tsv and replace all spaces with '_' 

        intervallUrl = None
        finalPath = None
        match time:
            case "hourly": intervallUrl = HOURLY_PATH
            case "daily": intervallUrl = DAILY_PATH
            case "monthly": 
                return HOSTNAME + MONTHLY_PATH + getPath(HOSTNAME, MONTHLY_PATH, location_vector + ext)
            case _: return None

        yearPath = getPath(HOSTNAME, intervallUrl, str(year))
        finalPath = getPath(HOSTNAME, intervallUrl + yearPath, location_vector + ext)
        return HOSTNAME + intervallUrl + yearPath + finalPath

def getPath(hostname: str, path: str, endsWith: str):
    urlList = getUrlPaths(hostname, path, CREDENTIALS)
    for ur in urlList:
        ur = str(ur)
        #print(ur)
        if (ur.endswith(endsWith)):
            return ur.rpartition(';')[2].removeprefix(' ') + '/'
    raise Exception("No path '" + hostname + path + '*' + endsWith + "*' found.")

def getFile(urlPath: str, filename: str, credentials: list):
    #print('ftp://' + credentials[0] + ':' + credentials[1] + '@' + urlPath + filename)
    #urllib.request.urlretrieve('ftp://' + credentials[0] + ':' + credentials[1] + '@' + urlPath + filename, 'tmp.txt')
    urllib.request.urlretrieve('ftp://ftp:tomiger450\@dmonies.com@ftp.ncdc.noaa.gov/pub/data/uscrn/products/daily01/2022/CRND0103-2022-AK_Deadhorse_3_S.txt', 'CRND0103-2022-AK_Deadhorse_3_S.txt')

def main():
    args = cliArgumentParser()
    finalUrl = getUrl(time=args.time_intervall, year=args.year, location_vector=args.location, ext='.txt')
    getFile(finalUrl.rpartition('/')[0], finalUrl.rpartition('/')[2], CREDENTIALS)

if __name__ == "__main__":
    main()