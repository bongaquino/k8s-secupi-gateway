import requests
from config.delta import delta_config

class DeltaProvider:
    def __init__(self):
        self.api_base_url = delta_config.get("api_base_url")
        self.api_key = delta_config.get("api_key")
        self.directory_id = delta_config.get("directory_id")
        self.edge_base_url = delta_config.get("edge_base_url")

    def upload(self, files=None):
        url = f"{self.api_base_url}/files/upload"
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }

        data = {
            "directoryId": self.directory_id
        }

        if files is None:
          raise Exception("File must be provided")
        
        response = requests.post(url, headers=headers, files=files, data=data)
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"Delta API error: {response.status_code} - {response.text}")
        
    def download(self, file_id):
        url = f"{self.api_base_url}/files/{file_id}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }

        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.content
        else:
            raise Exception(f"Delta API error: {response.status_code} - {response.text}")
        
    def delete(self, file_id):
        url = f"{self.api_base_url}/files/{file_id}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }

        response = requests.delete(url, headers=headers)
        if response.status_code == 200:
            return True
        else:
            raise Exception(f"Delta API error: {response.status_code} - {response.text}")
        
    def get_edge_base_url(self):
        return self.edge_base_url