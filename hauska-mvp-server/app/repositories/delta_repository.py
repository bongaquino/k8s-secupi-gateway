from bson.objectid import ObjectId

class DeltaRepository:
    def __init__(self, mongo_service):
        self.collection = mongo_service.get_collection("delta")

    def create(self, delta_data: dict):
        result = self.collection.insert_one(delta_data)
        return str(result.inserted_id)
    
    def get_delta_by_id(self, delta_id: str):
        return self.collection.find_one({"_id": ObjectId(delta_id)})
    
    def get_delta_by_cid(self, cid: str):
        return self.collection.find_one({"cid": cid})
    
    def get_delta_by_chat_id(self, chat_id: str):
        return list(self.collection.find({"chat_id": chat_id}))
    
    def delete_delta_by_id(self, delta_id: str):
        self.collection.delete_one({"_id": ObjectId(delta_id)})