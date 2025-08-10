from app.models.profile import Profile
from bson.objectid import ObjectId

class ProfileRepository:
    def __init__(self, mongo_service):
        self.collection = mongo_service.get_collection("profiles")

    def create(self, profile: Profile):
        result = self.collection.insert_one(profile.dict())
        return str(result.inserted_id)

    def read(self, profile_id: str):
        profile_data = self.collection.find_one({"_id": ObjectId(profile_id)})
        if profile_data:
            return Profile(**profile_data)
        return None
    
    def read_by_user_id(self, user_id: str):
        profile_data = self.collection.find_one({"user_id": user_id})
        if profile_data:
            return Profile(**profile_data)
        return None

    def update(self, profile_id: str, profile: Profile):
        self.collection.update_one(
            {"_id": ObjectId(profile_id)},
            {"$set": profile.dict()}
        )

    def update_by_user_id(self, user_id: str, profile: Profile):
        self.collection.update_one(
            {"user_id": user_id},
            {"$set": profile.dict()}
        )

    def delete(self, profile_id: str):
        self.collection.delete_one({"_id": ObjectId(profile_id)})