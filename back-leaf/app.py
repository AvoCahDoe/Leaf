# app.py
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
    # Correction de l'URL (espace en trop)
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': f"{address}, {city}",
        'format': 'json',
        'limit': 1
    }
    headers = {
        'User-Agent': 'MyMapApp/1.0'
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status() # Raise an exception for bad status codes
        data = response.json()
        
        if data:
            return float(data[0]['lat']), float(data[0]['lon'])
    except requests.exceptions.RequestException as e:
        print(f"Geocoding error: {e}")
    except (ValueError, KeyError, IndexError) as e:
        print(f"Error parsing geocoding response: {e}")
        
    return None, None    

# Serialize MongoDB document to JSON 
def serialize_marker(marker):
    serialized = {
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
        # --- Nouveaux champs ---
        'nombreEmployes': marker.get('nombreEmployes'),
        'chiffreAffaires': marker.get('chiffreAffaires'),
        'dateCreation': marker.get('dateCreation'), # Stocké comme string
        'identifiantBourse': marker.get('identifiantBourse'),
        'nombreClientsActifs': marker.get('nombreClientsActifs'),
        # ---------------------
    }
    return serialized

# GET all markers
@app.route('/markers', methods=['GET'])
def get_markers():
    try:

        markers = list(markers_collection.find())
        return jsonify([serialize_marker(m) for m in markers])
    except Exception as e:
        print(f"Error fetching markers: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# POST a new marker
@app.route('/markers', methods=['POST'])
def add_marker():
    try:
        data = request.json
        
        # Extraction des données, y compris les nouvelles
        lat = data.get('lat')
        lng = data.get('lng')
        address = data.get('address')
        city = data.get('city')

        # Geocode if lat/lng missing
        if (lat is None or lng is None) and address and city:
            lat, lng = geocode_address(address, city)
            
        # Si le géocodage échoue et qu'aucune coordonnée n'est fournie
        if lat is None or lng is None:
             return jsonify({'error': 'Impossible de géocoder l\'adresse et coordonnées manquantes.'}), 400

        marker = {
            'name': data.get('name'),
            'lat': lat,
            'lng': lng,
            'activity': data.get('activity'),
            'address': address,
            'city': city,
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
            'nombreEmployes': data.get('nombreEmployes'),
            'chiffreAffaires': data.get('chiffreAffaires'),
            'dateCreation': data.get('dateCreation'), # Stocké comme string
            'identifiantBourse': data.get('identifiantBourse'),
            'nombreClientsActifs': data.get('nombreClientsActifs'),
        }
        
        # Nettoyer les champs None/undefined si nécessaire 
        # marker = {k: v for k, v in marker.items() if v is not None}
        
        result = markers_collection.insert_one(marker)
        # Retourner le marqueur créé avec son ID
        created_marker = markers_collection.find_one({'_id': result.inserted_id})
        return jsonify(serialize_marker(created_marker)), 201

    except Exception as e:
        print(f"Error adding marker: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# DELETE a marker
@app.route('/markers/<marker_id>', methods=['DELETE'])
def delete_marker(marker_id):
    try:
        result = markers_collection.delete_one({'_id': ObjectId(marker_id)})
        if result.deleted_count == 1:
            return jsonify({'status': 'deleted'}), 200
        else:
            return jsonify({'error': 'Marker not found'}), 404
    except Exception as e:
        print(f"Error deleting marker: {e}")
        # Gérer l'exception spécifique pour ObjectId invalide
        if "invalid ObjectId" in str(e):
             return jsonify({'error': 'Invalid marker ID format'}), 400
        return jsonify({'error': 'Internal server error'}), 500

# PUT (update) a marker
@app.route('/markers/<marker_id>', methods=['PUT'])
def update_marker(marker_id):
    try:
        data = request.json
        

        update_data = {k: v for k, v in data.items() if k != 'id'}

        result = markers_collection.update_one(
            {'_id': ObjectId(marker_id)},
            {'$set': update_data}
        )
        if result.matched_count == 1:
            # Retourner le marqueur mis à jour
            updated_marker = markers_collection.find_one({'_id': ObjectId(marker_id)})
            return jsonify(serialize_marker(updated_marker)), 200
        else:
            return jsonify({'error': 'Marker not found'}), 404
            
    except Exception as e:
        print(f"Error updating marker: {e}")
        # Gérer l'exception spécifique pour ObjectId invalide
        if "invalid ObjectId" in str(e):
             return jsonify({'error': 'Invalid marker ID format'}), 400
        return jsonify({'error': 'Internal server error'}), 500


# Run Flask app
if __name__ == '__main__':
    app.run(debug=True) #debug=False en prod