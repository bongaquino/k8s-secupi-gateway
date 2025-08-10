import requests
from config.mnmlai import mnmlai_config
import json

class MNMLAIProvider:
    def __init__(self):
        self.api_key = mnmlai_config.get("api_key")
        self.base_url = mnmlai_config.get("base_url")

    def status_check(self, id: str):
        # Construct the URL with the given ID
        url = f"{self.base_url}/v1/status/{id}"
        
        # Set the headers to include the Authorization Bearer token and Accept type
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json"
        }
        
        try:
            # Make a GET request to the external API
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            try:
                # Attempt to parse the JSON response
                data = response.json()
                return data
            except json.JSONDecodeError as e:
                raise Exception("Invalid JSON response from API")

        except requests.RequestException as e:
            # Handle any request-related exceptions
            raise Exception(f"MNMLAI API error: {e}")
        
    def generate_design_v1(self, route, files, data):
        url =  f"{self.base_url}/v1/{route}"
        headers = {
            'Authorization': f'Bearer {self.api_key}'
        }

        try:
            # Make a POST request to the external API
            response = requests.post(url, files=files, data=data, headers=headers)
            return response.json()
        
        except requests.RequestException as e:
            # Handle any request-related exceptions
            raise Exception(f"MNMLAI API error: {e}")