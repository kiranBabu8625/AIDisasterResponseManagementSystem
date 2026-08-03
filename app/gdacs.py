import requests

GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"

def get_gdacs_events():
    try:
        response = requests.get(GDACS_URL, timeout=10)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.Timeout:
        return {"error": "GDACS API timed out"}

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}