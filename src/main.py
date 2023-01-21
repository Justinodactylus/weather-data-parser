from fileinput import filename
from __const__ import *
import ftplib
import csv
import argparse
from lxml import etree
from copy import deepcopy

INTERVALL_PATH = ''

def parseCredentials(string):
    """Parses given credentials from cli `--credentials` input with the necessary format: `USERNAME:PASSWORD`."""

    global CREDENTIALS
    string = str(string)
    strTuple = string.partition(':')

    if (strTuple[1] == ''):
        raise Exception("The given credentials don't have the right format USERNAME:PASSWORD.")
    CREDENTIALS = [strTuple[0], strTuple[2]]

def setTimeIntervall(timeIntervall: str):
    """Sets the global `INTERVALL_PATH` depending on the given `timeIntervall`."""

    global INTERVALL_PATH
    match timeIntervall:
        case "hourly": INTERVALL_PATH = HOURLY_PATH
        case "daily": INTERVALL_PATH = DAILY_PATH
        case "monthly": INTERVALL_PATH = MONTHLY_PATH 
        case _: return None

def cliArgumentParser():
    """`Returns` a ArgumentParser instance with specific arguments necessary for the program."""

    argParser = argparse.ArgumentParser(description='A parser to collect weather data and converts it into a XML schema.')
    argParser.add_argument("-t", "--time-intervall", type=str, choices=["hourly", "daily", "monthly"], required=True)
    argParser.add_argument("-y", "--year", type=int, choices=range(2000, 2023), required=False)
    argParser.add_argument("-l", "--location", type=str, help="The state location vector from the stations.tsv file.", required=True)
    argParser.add_argument("-c", "--credentials", type=parseCredentials, help="The credentials to login to a FTP server, seperated by a ':'.", required=False)

    return argParser.parse_args()

def getUrlPaths(hostname: str, path: str, credentials: list):
    """`Returns` a list of all files and directories of in the `path` of the given `hostname` of a FTP server."""

    if (hostname.startswith("http://") or hostname.startswith("https://")):
        hostname = hostname.partition('//')[2]

    ftp = ftplib.FTP(hostname)
    ftp.login(credentials[0], credentials[1])
    ftp.cwd(path)

    ls = []
    ftp.retrlines('MLSD', ls.append)
    ftp.quit()
    return ls

def getPath(hostname: str, path: str, endsWith: str, credentials: list):
    """`Returns` an url if a file or directory ending with `endsWith` is found in the `path` of the given `hostname`."""

    urlList = getUrlPaths(hostname, path, credentials)
    for ur in urlList:
        ur = str(ur)
        if (ur.endswith(endsWith)):
            return ur.rpartition(';')[2].removeprefix(' ') + '/'
    raise Exception("No path '" + hostname + path + '*' + endsWith + "*' found.")

def getUrl(intervall: str, year: int, location_vector: str, ext: str, credentials: list):
    """`Returns` an url of a FTP file ending with `location_vector + ext` when its found in the `ftp.ncdc.noaa.gov/pub/data/uscrn/products/` directories in the given `intervall` and `year` path."""
    
    if intervall == 'monthly' and INTERVALL_PATH:
        return HOSTNAME + INTERVALL_PATH + getPath(HOSTNAME, MONTHLY_PATH, location_vector + ext, credentials).removesuffix('/')

    yearPath = getPath(HOSTNAME, INTERVALL_PATH, str(year), credentials)
    finalPath = getPath(HOSTNAME, INTERVALL_PATH + yearPath, location_vector + ext, credentials).removesuffix('/')
    return HOSTNAME + INTERVALL_PATH + yearPath + finalPath

def getFile(url: str, credentials: list = ["ftp", None]):
    """Downloads a FTP file with optional credentials when needed from a given `url`.\n
`Returns` the files name."""

    if (url.startswith("http://") or url.startswith("https://")):
        url = url.partition('//')[2]

    hostname = url.partition('/')[0]
    path = '/' + url.partition('/')[2].rpartition('/')[0] + '/'
    filename = url.rpartition('/')[2]

    # Connect to FTP Server
    ftp_server = ftplib.FTP(hostname)

    ftp_server.login(credentials[0], credentials[1])

    # Change current directory
    ftp_server.cwd(path)

    # Start download and write it to a file
    ftp_server.retrbinary("RETR " + filename, open(filename, 'wb').write)
    
    ftp_server.quit()
    return filename

def getChildOfParentMap(parentMap: dict[etree._Element, etree._Element], name: str | etree._Element):
    """`Returns` the child with the given `name` of a given parent map."""

    for child in parentMap.keys():
        if child.tag == (name.tag if isinstance(name, etree._Element) else name):
            return child

def getParentOfParentMap(parentMap: dict[etree._Element, etree._Element], name: str | etree._Element):
    """`Returns` the corresponding parent of a child with the given `name` of a given parent map."""

    for child, parent in parentMap.items():
        if child.tag == (name.tag if isinstance(name, etree._Element) else name):
            return parent

def getParentMapOfXMLTree(xmlTree: etree.ElementTree):
    """`Returns` a dictionary where all childs (`key`) are mapped to their corresponding parents (`value`) of a given XML tree."""

    return {child: parent for parent in xmlTree.getroot().iter() for child in parent} # safes map of childs and their parents in tree

def appendElementToOtherElement(parent: etree._Element, child: etree._Element):
    """Appends an element to another element."""

    if child is not None and parent is not None:
        parent.append(child)
    else:
        print("Parent or child is null.")

def validateAndParseXML(pathToXMLFile: str, dtd_validation=True, load_dtd=False, remove_comments=False, remove_pis=False, no_network=True):
    """Validate a XML for well-formedness and validate the given XML over a DTD if present."""

    xmlTree = None
    print('Testing for well-formedness and validate document over a DTD if present ...')
    try:
        if etree.parse(pathToXMLFile).docinfo.doctype == '':
            dtd_validation = False
        parser = etree.XMLParser(dtd_validation=dtd_validation, load_dtd=load_dtd, remove_comments=remove_comments, remove_pis=remove_pis, no_network=no_network)
        xmlTree = etree.parse(source=pathToXMLFile, parser=parser)
    except (etree.ParseError, etree.XMLSyntaxError) as err:
        print('ERROR: {}'.format(str(err)))
        exit()
    else:
        print('Congrats, {} is well-formed!\n'.format(pathToXMLFile))
    return xmlTree

def getHeaders(headerFileName: str='headers.txt'):
    """Downloads the `headers.txt` for the given intervall in `ftp.ncdc.noaa.gov/pub/data/uscrn/products/`.\n
`Returns` a list of headers defined in the downloaded file."""

    getFile(HOSTNAME + INTERVALL_PATH + headerFileName, CREDENTIALS)

    with open(headerFileName, 'r') as headerFile:
        headerReader = csv.reader(headerFile, delimiter=' ')
        for i, line in enumerate(headerReader):
            if i == 1:
                line.pop() # last element of list is always empty
                return line

def putDataToXMLElement(xmlTree: etree._Element, elementName: str, data: str):
    """Sets a string (`data`) as the text of the given `elementName` in the given XML tree (`xmlTree`)."""

    for element in xmlTree.iter(elementName):
        element.text = data

def putListOfDataToXML(xmlElement: etree._Element, headers: list[str], headersXMLMapping: dict[str,str], data: list[str] | str, delimiter: str=' '):
    """Put a list or a string separated by a ``delimiter`` of data to a XML.\n\nNeeds a `headersXMLMapping` of the column header names of your data to the XML element tag names of your given XML template.\n
Also needs a list of your column header names in the same order as your data is defined.\n"""

    if isinstance(data, str):
        data = delimiter.join(data.split())
        data = data.split()
    for j, value in enumerate(data):
        if j < headers.__len__():
            xmlElementTag = headersXMLMapping.get(headers[j])
            if xmlElementTag and xmlElement is not None:
                putDataToXMLElement(xmlElement, xmlElementTag, value)


def putDataToXML(pathToXMLTemplate: str, pathToData: str, headersXMLMapping: dict[str,str], childElementsTagToReplicate: str, delimiter: str=' '):
    """Put data separated by a ``delimiter`` into a XML template.\n\nYou need to pass a `headersXMLMapping` of the column headers of your data (f.e. in ``headers.txt`` of your needed intervall repository: hourly, daily, monthly) to the XML element tag names of your given XML template.\n
Furthermore you need to define a ``childElementsTagToReplicate`` which is the XML elements tag name which has to be repeatedly append to its parent element so all the data that changes in your data file will written to the XML.\n
Your given XML file is been validated over a DTD if present and tested if it's well-formed.\n
A file is been created in the same location where the given XML template is from.\n
`Returns` the files name of the created XML filled with the given data."""

    xmlTree = validateAndParseXML(pathToXMLTemplate, dtd_validation=True, remove_comments=False, remove_pis=False)
    headers = getHeaders()
    parentMap = getParentMapOfXMLTree(xmlTree)
    parent = getParentOfParentMap(parentMap, childElementsTagToReplicate)
    elementToReplicate = deepcopy(getChildOfParentMap(parentMap, childElementsTagToReplicate))

    with open(pathToData, 'r') as dataFile:
        firstLine = dataFile.readline()

        # put first line of the data file to all elements found in the document + its child to replicate -> only works for data that will not get changed at some point
        putListOfDataToXML(xmlTree.getroot(), headers, headersXMLMapping, firstLine, delimiter)

        # put the remaining lines of the data file to the childElementsTagToReplicate and append it to its parent
        for line in dataFile:
            child = deepcopy(elementToReplicate)
            putListOfDataToXML(child, headers, headersXMLMapping, line)
            appendElementToOtherElement(parent, child)

    fileName = pathToXMLTemplate.rpartition('.')[0] + '_filled.' + pathToXMLTemplate.rpartition('.')[2]

    xmlTree.write(fileName, xml_declaration=True, pretty_print=True, encoding=xmlTree.docinfo.encoding, standalone=xmlTree.docinfo.standalone)
    print("Putting data to XML template finished. Saved it to '" + fileName + "'.\nTesting again for well-formedness ...")
    validateAndParseXML(fileName, dtd_validation=True, remove_comments=False, remove_pis=False)
    return xmlTree    

def main():
    args = cliArgumentParser()
    setTimeIntervall(args.time_intervall)

    finalUrl = getUrl(args.time_intervall, args.year, args.location, '.txt', CREDENTIALS)

    print("Following file was found: '" + finalUrl + "'\n\nStarting download ...\n")

    fileName = getFile(finalUrl, CREDENTIALS)

    print("Download of file finished.\n\nStart putting data to given XML template.\n")

    putDataToXML("resources/weather-data.xml", fileName, HEADER_HOURLY_MAPPING, 'UTC_Date')

def apiMain(intervall: str, year: int, location: str):
    #args = cliArgumentParser()
    setTimeIntervall(intervall)

    finalUrl = getUrl(intervall, year, location, '.txt', CREDENTIALS)

    print("Following file was found: '" + finalUrl + "'\n\nStarting download ...\n")

    fileName = getFile(finalUrl, CREDENTIALS)

    print("Download of file finished.\n\nStart putting data to given XML template.\n")

    filledXML = putDataToXML("resources/weather-data.xml", fileName, HEADER_HOURLY_MAPPING, 'UTC_Date')

    return etree.tostring(filledXML)


if __name__ == "__main__":
    main()