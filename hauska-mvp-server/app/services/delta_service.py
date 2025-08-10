from datetime import datetime

class DeltaService:
    def __init__(self, delta_provider, delta_repository):
        self.delta_provider = delta_provider
        self.delta_repository = delta_repository

    def upload_image(self, files):
        response = self.delta_provider.upload(files)

        # Save the query and response to the database
        delta_data = {
            "file_id": response["id"],
            "cid": response["cid"],
            "created_at": datetime.utcnow()
        }
        id = self.delta_repository.create(delta_data)

        return id
    
    def download_image(self, id) -> bytes:
        data = self.delta_repository.get_delta_by_id(id)
        if data is None:
            raise Exception("File not found")      

        response = self.delta_provider.download(data["file_id"])
        return response
    
    def delete_image(self, id):
        data = self.delta_repository.get_delta_by_id(id)
        if data is None:
            raise Exception("File not found")   
        
        self.delta_repository.delete_delta_by_id(id)
        response = self.delta_provider.delete(data["file_id"])
        return response

    def get_image_url(self, id):
        data = self.delta_repository.get_delta_by_id(id)
        if data is None:
            raise Exception("File not found")
        
        edge_base_url = self.delta_provider.get_edge_base_url()

        return f"{edge_base_url}/{data['cid']}"
        
        
        
