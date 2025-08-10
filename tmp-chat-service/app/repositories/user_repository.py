from app.models.user import User
from bson.objectid import ObjectId

class UserRepository:
    def __init__(self, mongo_service):
        self.collection = mongo_service.get_collection("users")

    def create(self, user: User):
        result = self.collection.insert_one(user.dict(exclude={"id"}))  # Exclude id when inserting
        return str(result.inserted_id)

    def read(self, user_id: str):
        user_data = self.collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user_data["id"] = str(user_data["_id"])  # Map _id to id
            return User(**user_data)
        return None

    def find_by_email(self, email: str):
        user_data = self.collection.find_one({"email": email})
        if user_data:
            user_data["id"] = str(user_data["_id"])  # Map _id to id
            return User(**user_data)
        return None

    def update(self, user_id: str, user: User):
        self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": user.dict(exclude={"id"})}  # Exclude id when updating
        )

    def delete(self, user_id: str):
        self.collection.delete_one({"_id": ObjectId(user_id)})