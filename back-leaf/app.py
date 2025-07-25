from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Atlas 
load_dotenv()
mongo_uri = os.environ.get("MONGO_URI")
print("Mongo URI:", mongo_uri)
client = MongoClient(mongo_uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print(" Connected to MongoDB Atlas successfully.")
except Exception as e:
    print(" Failed to connect to MongoDB Atlas:", e)

# Access database 
db = client['map_db']
markers_collection = db['markers']

# Geocode  (OpenStreetMap)
def geocode_address(address, city):
    full_address = f"{address}, {city}"
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': full_address,
        'format': 'json',
        'limit': 1
    }
    headers = {
        'User-Agent': 'MyMapApp/1.0'
    }

    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    
    if data:
        return float(data[0]['lat']), float(data[0]['lon'])
    return None, None    

# Se MongoDB 
def serialize_marker(marker):
    return {
        'id': str(marker['_id']),
        'name': marker.get('name'),
        'lat': marker.get('lat'),
        'lng': marker.get('lng'),
        'activity': marker.get('activity'),
        'address': marker.get('address'),
        'city': marker.get('city'),
        'phone': marker.get('phone'),
        'fax': marker.get('fax'),
        'email': marker.get('email'),
        'rc': marker.get('rc'),
        'ice': marker.get('ice'),
        'form': marker.get('form'),
        'addr_housenumber': marker.get('addr_housenumber'),
        'addr_street': marker.get('addr_street'),
        'addr_postcode': marker.get('addr_postcode'),
        'addr_province': marker.get('addr_province'),
        'addr_place': marker.get('addr_place'),
    }

# GET 
@app.route('/markers', methods=['GET'])
def get_markers():
    markers = list(markers_collection.find())
    return jsonify([serialize_marker(m) for m in markers])

# POST 
@app.route('/markers', methods=['POST'])
def add_marker():
    data = request.json
    lat = data.get('lat')
    lng = data.get('lng')

    # if lat/lng missing
    if not lat or not lng:
        lat, lng = geocode_address(data.get('address'), data.get('city'))

    marker = {
        'name': data.get('name'),
        'lat': lat,
        'lng': lng,
        'activity': data.get('activity'),
        'address': data.get('address'),
        'city': data.get('city'),
        'phone': data.get('phone'),
        'fax': data.get('fax'),
        'email': data.get('email'),
        'rc': data.get('rc'),
        'ice': data.get('ice'),
        'form': data.get('form'),
        'addr_housenumber': data.get('addr_housenumber'),
        'addr_street': data.get('addr_street'),
        'addr_postcode': data.get('addr_postcode'),
        'addr_province': data.get('addr_province'),
        'addr_place': data.get('addr_place'),
    }
    result = markers_collection.insert_one(marker)
    return jsonify({'id': str(result.inserted_id)}), 201

# DELETE 
@app.route('/markers/<marker_id>', methods=['DELETE'])
def delete_marker(marker_id):
    result = markers_collection.delete_one({'_id': ObjectId(marker_id)})
    if result.deleted_count == 1:
        return jsonify({'status': 'deleted'}), 200
    return jsonify({'error': 'Marker not found'}), 404

# PUT 
@app.route('/markers/<marker_id>', methods=['PUT'])
def update_marker(marker_id):
    data = request.json
    update = {k: v for k, v in data.items() if v is not None}
    result = markers_collection.update_one(
        {'_id': ObjectId(marker_id)},
        {'$set': update}
    )
    if result.matched_count == 1:
        return jsonify({'status': 'updated'}), 200
    return jsonify({'error': 'Marker not found'}), 404

# Run Flask app
if __name__ == '__main__':
    app.run(debug=True)
