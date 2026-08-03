import requests

# Placeholder NDMA feed (replace with an official endpoint if your mentor provides one)
NDMA_URL = "https://ndma.gov.in/"


def get_ndma_alerts():
    try:
        response = requests.get(NDMA_URL, timeout=10)

        return {
            "status": "connected",
            "message": "NDMA module is ready for integration.",
            "website": NDMA_URL,
            "http_status": response.status_code
        }

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
