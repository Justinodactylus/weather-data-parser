from flask import Flask
from flask import Response
from main import apiMain
import csv

app = Flask(__name__)

STATIONS_TSV_LOCATION = "resources/stations.tsv"

def getLocationVectorList(locationVectorList: str) -> list:
    with open(locationVectorList) as tsv_file:
        stations_reader = csv.reader(tsv_file, delimiter="\t")

        station_vector_list = []
        for list in stations_reader:
            station_vector_list.append(list[4].replace(' ', '_')) # gets all state location vectors (place 4) from stations.tsv and replace all spaces with '_'
        return station_vector_list


def validateRequestParams(intervall: str, year: int, location: str) -> bool:
    if (intervall not in ['hourly','daily','monthly']):
        raise Exception("Given intervall is none of the following strings: 'hourly', 'daily' or 'monthly'.")
    if year not in range(2000, 2023):
        raise Exception("Given year has to be in the range of 2000 to 2023")

    locationVectorList = getLocationVectorList(STATIONS_TSV_LOCATION)
    if location not in locationVectorList:
        raise Exception("Given location must be a valid location vector. See station.tsv in the repo.")

    return True

@app.route('/<string:intervall>/<int:year>/<string:location>/')
def getWeatherData(intervall, year, location):
    filledXML = ''
    intervall = str(intervall).lower()
    location = str(location).upper()
    try:
        validateRequestParams(intervall, year, location)
    except Exception as err:
        return str('Bad request: {}<br><br>Usage path: /string:intervall/int:year/string:location/').format(str(err)), 400
    
    filledXML = apiMain(intervall, year, location)
    resp = Response(filledXML, mimetype='application/xml')
    resp.headers["Content-Type"] = "text/xml; charset=utf-8"
    return resp
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)