from bson.objectid import ObjectId

class ChatRepository:
    def __init__(self, mongo_service):
        self.collection = mongo_service.get_collection("chats")

    def create(self, chat_data: dict):
        result = self.collection.insert_one(chat_data)
        return str(result.inserted_id)

    def get_chats_by_user(self, user_id: str):
        return list(self.collection.find({"user_id": user_id}).sort("created_at", -1))
    
    def get_chats_by_user(self, user_id: str):
        chats = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        return [self._format_chat(chat) for chat in chats]

    def _format_chat(self, chat):
        chat["_id"] = str(chat["_id"])
        chat["created_at"] = chat["created_at"].isoformat()
        return chat
    
    def get_chat_by_message_id(self, message_id: str):
        return self.collection.find_one({"_id": ObjectId(message_id)})
        
    def clear_chats_by_user(self, user_id: str):
        self.collection.delete_many({"user_id": user_id})

    def delete_chat_by_id(self, message_id: str):
        self.collection.delete_one({"_id": ObjectId(message_id)})