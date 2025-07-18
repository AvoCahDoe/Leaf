from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
import os

from dotenv import load_dotenv



app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection
load_dotenv()

mongo_uri = os.environ.get("MONGO_URI")
print("Mongo URI:", mongo_uri)
client = MongoClient(mongo_uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print(" Connected to MongoDB Atlas successfully.")
except Exception as e:
    print(" Failed to connect to MongoDB Atlas:", e)

# Access your database and collection
db = client['map_db']
markers_collection = db['markers']

# Serialize MongoDB documents
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
    }

# GET all markers
@app.route('/markers', methods=['GET'])
def get_markers():
    markers = list(markers_collection.find())
    return jsonify([serialize_marker(m) for m in markers])

# POST a new marker
@app.route('/markers', methods=['POST'])
def add_marker():
    data = request.json
    marker = {
        'name': data.get('name'),
        'lat': data.get('lat'),
        'lng': data.get('lng'),
        'activity': data.get('activity'),
        'address': data.get('address'),
        'city': data.get('city'),
        'phone': data.get('phone'),
        'fax': data.get('fax'),
        'email': data.get('email'),
        'rc': data.get('rc'),
        'ice': data.get('ice'),
        'form': data.get('form'),
    }
    result = markers_collection.insert_one(marker)
    return jsonify({'id': str(result.inserted_id)}), 201

# DELETE a marker
@app.route('/markers/<marker_id>', methods=['DELETE'])
def delete_marker(marker_id):
    result = markers_collection.delete_one({'_id': ObjectId(marker_id)})
    if result.deleted_count == 1:
        return jsonify({'status': 'deleted'}), 200
    return jsonify({'error': 'Marker not found'}), 404

# PUT (update) a marker
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
