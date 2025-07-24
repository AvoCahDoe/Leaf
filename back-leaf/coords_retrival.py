
import requests


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



if __name__ == "__main__":

    test_cases = [
        ("Avenue Mohamed V", "Marrakech"),
        ("Rue Ibn Sina", "Casablanca"),
        ("Boulevard Anfa", "Casablanca"),
        ("Place Jemaa el-Fna", "Marrakech"),
        ("InvalidAddress", "InvalidCity"),
    ]

    for address, city in test_cases:
        lat, lon = geocode_address(address, city)
        print(f"{address}, {city} -> lat: {lat}, lon: {lon}")
