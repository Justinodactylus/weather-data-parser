from flask import Flask
from flask import Response
from flask_cors import CORS
from main import apiMain
import json
import csv
import os

app = Flask(__name__)

CORS(app)

STATIONS_TSV_LOCATION = "resources/stations.tsv"

def getLocationVectorList() -> list:
    with open(STATIONS_TSV_LOCATION) as tsv_file:
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

    locationVectorList = getLocationVectorList()
    if location not in locationVectorList:
        raise Exception("Given location must be a valid location vector. See station.tsv in the repo.")

    return True

@app.route('/locationVectors/')
def getLocationVectors():
    vectorList = getLocationVectorList()
    response = Response(json.dumps(vectorList), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

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
    response = Response(filledXML, mimetype='application/xml')
    response.headers["Content-Type"] = "text/xml; charset=utf-8"
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=os.environ.get("FLASK_SERVER_PORT", 5049), debug=True)