from flask import Flask
from flask import Response
from flask_cors import CORS
from main import apiMain, validateRequestParams, getLocationVectorList
import json
import csv
import os

app = Flask(__name__)

CORS(app)

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