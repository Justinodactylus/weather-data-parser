import ftplib
import csv
import argparse

HOSTNAME='ftp.ncdc.noaa.gov'
HOURLY_PATH='/pub/data/uscrn/products/hourly02/'
DAILY_PATH='/pub/data/uscrn/products/daily01/'
MONTHLY_PATH='/pub/data/uscrn/products/monthly01/'
CREDENTIALS = ["ftp", "tomiger450\@dmonies.com"] # random email

def parseCredentials(string):
    global CREDENTIALS
    string = str(string)
    strTuple = string.partition(':')

    if (strTuple[1] == ''):
        raise Exception("The given credentials don't have the right format USERNAME:PASSWORD.")
    CREDENTIALS = [strTuple[0], strTuple[2]]

def cliArgumentParser():
    argParser = argparse.ArgumentParser(description='A parser to collect weather data and converts it into a XML schema.')
    argParser.add_argument("-t", "--time-intervall", type=str, choices=["hourly", "daily", "monthly"], required=True)
    argParser.add_argument("-y", "--year", type=int, choices=range(2000, 2023), required=False)
    argParser.add_argument("-l", "--location", type=str, help="The state location vector from the stations.tsv file.", required=True)
    argParser.add_argument("-c", "--credentials", type=parseCredentials, help="The credentials to login to a FTP server, seperated by a ':'.", required=False)

    return argParser.parse_args()

def getUrlPaths(url: str, path: str, credentials: list):
    ftp = ftplib.FTP(url)
    ftp.login(credentials[0], credentials[1])
    ftp.cwd(path)
    ls = []
    ftp.retrlines('MLSD', ls.append)
    return ls

def getPath(hostname: str, path: str, endsWith: str, credentials: list):
    urlList = getUrlPaths(hostname, path, credentials)
    for ur in urlList:
        ur = str(ur)
        if (ur.endswith(endsWith)):
            return ur.rpartition(';')[2].removeprefix(' ') + '/'
    raise Exception("No path '" + hostname + path + '*' + endsWith + "*' found.")

def getUrl(time: str, year: int, location_vector: str, ext: str, credentials: list):
    stations = dict()
    with open("resources/stations.tsv") as tsv_file:
        stations_reader = csv.reader(tsv_file, delimiter="\t")

        station_vector_list = []
        for list in stations_reader:
            station_vector_list.append(list[4].replace(' ', '_')) # gets all state location vectors from stations.tsv and replace all spaces with '_' 

        intervallUrl = None
        match time:
            case "hourly": intervallUrl = HOURLY_PATH
            case "daily": intervallUrl = DAILY_PATH
            case "monthly": 
                return HOSTNAME + MONTHLY_PATH + getPath(HOSTNAME, MONTHLY_PATH, location_vector + ext, credentials).removesuffix('/')
            case _: return None

        yearPath = getPath(HOSTNAME, intervallUrl, str(year), credentials)
        finalPath = getPath(HOSTNAME, intervallUrl + yearPath, location_vector + ext, credentials).removesuffix('/')
        return HOSTNAME + intervallUrl + yearPath + finalPath

def getFile(url: str, credentials: list):
    hostname = url.partition('/')[0]
    path = '/' + url.partition('/')[2].rpartition('/')[0] + '/'
    filename = url.rpartition('/')[2]

    # Connect to FTP Server
    ftp_server = ftplib.FTP(hostname)

    # Login with credentials
    ftp_server.login(credentials[0], credentials[1])

    # Change current directory
    ftp_server.cwd(path)

    # Start download and write it to a file
    ftp_server.retrbinary("RETR " + filename, open(filename, 'wb').write)
    
    # Close the Connection
    ftp_server.quit()

def main():
    args = cliArgumentParser()
    
    finalUrl = getUrl(args.time_intervall, args.year, args.location, '.txt', CREDENTIALS)

    print("Following file was found: '" + finalUrl + "'\n\nStarting download ...\n")

    getFile(finalUrl, CREDENTIALS)

    print("Download of file finished.\n\n")

if __name__ == "__main__":
    main()