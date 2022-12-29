from fileinput import filename
from __const__ import *
import ftplib
import csv
import argparse
import lxml.etree as ET
from copy import deepcopy

INTERVALL_PATH = ''

def parseCredentials(string):
    global CREDENTIALS
    string = str(string)
    strTuple = string.partition(':')

    if (strTuple[1] == ''):
        raise Exception("The given credentials don't have the right format USERNAME:PASSWORD.")
    CREDENTIALS = [strTuple[0], strTuple[2]]

def setTimeIntervall(timeIntervall: str):
    global INTERVALL_PATH
    match timeIntervall:
            case "hourly": INTERVALL_PATH = HOURLY_PATH
            case "daily": INTERVALL_PATH = DAILY_PATH
            case "monthly": INTERVALL_PATH = MONTHLY_PATH 
            case _: return None

def cliArgumentParser():
    argParser = argparse.ArgumentParser(description='A parser to collect weather data and converts it into a XML schema.')
    argParser.add_argument("-t", "--time-intervall", type=str, choices=["hourly", "daily", "monthly"], required=True)
    argParser.add_argument("-y", "--year", type=int, choices=range(2000, 2023), required=False)
    argParser.add_argument("-l", "--location", type=str, help="The state location vector from the stations.tsv file.", required=True)
    argParser.add_argument("-c", "--credentials", type=parseCredentials, help="The credentials to login to a FTP server, seperated by a ':'.", required=False)

    return argParser.parse_args()

def getUrlPaths(url: str, path: str, credentials: list):
    if (url.startswith("http://") or url.startswith("https://")):
        url = url.partition('//')[2]

    ftp = ftplib.FTP(url)
    ftp.login(credentials[0], credentials[1])
    ftp.cwd(path)
    ls = []
    ftp.retrlines('MLSD', ls.append)
    ftp.quit()
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

        if time == 'monthly' and INTERVALL_PATH:
            return HOSTNAME + INTERVALL_PATH + getPath(HOSTNAME, MONTHLY_PATH, location_vector + ext, credentials).removesuffix('/')

        yearPath = getPath(HOSTNAME, INTERVALL_PATH, str(year), credentials)
        finalPath = getPath(HOSTNAME, INTERVALL_PATH + yearPath, location_vector + ext, credentials).removesuffix('/')
        return HOSTNAME + INTERVALL_PATH + yearPath + finalPath

def getFile(url: str, credentials: list): 
    if (url.startswith("http://") or url.startswith("https://")):
        url = url.partition('//')[2]

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
    return filename

def getChildOfParentMap(parentMap: dict[ET._Element, ET._Element], name: str | ET._Element):
    for child in parentMap.keys():
        if child.tag == (name.tag if isinstance(name, ET._Element) else name):
            return child

def getParentOfParentMap(parentMap: dict[ET._Element, ET._Element], name: str | ET._Element):
    for child, parent in parentMap.items():
        if child.tag == (name.tag if isinstance(name, ET._Element) else name):
            return parent

def getParentMapOfXMLTree(xmlTree: ET.ElementTree):
    return {child: parent for parent in xmlTree.getroot().iter() for child in parent} # safes map of childs and their parents in tree

def appendChildToParent(parent: ET._Element, child: ET._Element):
    if child is not None and parent is not None:
        parent.append(child)
        return child
    else:
        print("Parent or child is null.")

def getHeaders(headerFileName: str='headers.txt'):
    getFile(HOSTNAME + INTERVALL_PATH + headerFileName, CREDENTIALS)

    with open(headerFileName, 'r') as headerFile:
        headerReader = csv.reader(headerFile, delimiter=' ')
        for i, line in enumerate(headerReader):
            if i == 1:
                line.pop() # last element of list is always empty
                return line

def putDataToXMLElement(xmlTree: ET._Element, elementName: str, data: str):
    for element in xmlTree.iter(elementName):
        element.text = data

def putListOfDataToXML(xmlElement: ET._Element, headers: list[str], headersXMLMapping: dict[str,str], data: list[str] | str, delimiter: str=' '):
    if isinstance(data, str):
        data = delimiter.join(data.split())
        data = data.split()
    for j, value in enumerate(data):
        if j < headers.__len__():
            xmlElementTag = headersXMLMapping.get(headers[j])
            if xmlElementTag and xmlElement is not None:
                putDataToXMLElement(xmlElement, xmlElementTag, value)
        
def putDataToXML(pathToXMLTemplate: str, pathToData: str, mapping: dict[str,str], childElementsTagToReplicate: str):
    parser = ET.XMLParser(encoding='UTF-8', dtd_validation=False, remove_comments=False, remove_pis=False)
    xmlTree = ET.parse(source=pathToXMLTemplate, parser=parser)
    headers = getHeaders()
    parentMap = getParentMapOfXMLTree(xmlTree)
    parent = getParentOfParentMap(parentMap, childElementsTagToReplicate)
    elementToReplicate = deepcopy(getChildOfParentMap(parentMap, childElementsTagToReplicate))

    with open(pathToData, 'r') as dataFile:
        firstLine = dataFile.readline()

        # put first line of the data file to childElementsTagToReplicate parent element + its child to replicate
        putListOfDataToXML(parent, headers, mapping, firstLine)

        # put the remaining lines of the data file to the xml and replicate the childElementsTagToReplicate element and append it to its parent
        for line in dataFile:
            child = deepcopy(elementToReplicate)
            putListOfDataToXML(child, headers, mapping, line)
            appendChildToParent(parent, child)

    fileName = ''
    if pathToXMLTemplate.rpartition('/')[2]:
        fileName = pathToXMLTemplate.rpartition('/')[2].rpartition('.')[0] + '_filled.' + pathToXMLTemplate.rpartition('.')[2]
    else:
        fileName = pathToXMLTemplate.rpartition('.')[0] + '_filled.' + pathToXMLTemplate.rpartition('.')[2]

    xmlTree.write(fileName, xml_declaration=True, encoding='UTF-8', pretty_print=True)
    

def main():
    args = cliArgumentParser()
    setTimeIntervall(args.time_intervall)
    
    finalUrl = getUrl(args.time_intervall, args.year, args.location, '.txt', CREDENTIALS)

    print("Following file was found: '" + finalUrl + "'\n\nStarting download ...\n")

    fileName = getFile(finalUrl, CREDENTIALS)

    print("Download of file finished.\n\nStart putting data to given XML template.\n")

    putDataToXML("resources/weather-data.xml", fileName, HEADER_HOURLY_MAPPING, 'UTC_Date')

    print("Putting data to XML template finished.")

if __name__ == "__main__":
    main()