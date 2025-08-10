from datetime import datetime

class ChatService:
    def __init__(self, chat_repository, openai_provider):
        self.chat_repository = chat_repository
        self.openai_provider = openai_provider

    def process_and_save_message(self, user_id: str, query_message: str, image_base64=None) -> str:
        # Query the LLM for a response
        response_message = self.openai_provider.query(query_message, image_base64)
            
        # Save the query and response to the database
        chat_data = {
            "user_id": user_id,
            "query_message": query_message,
            "response_message": response_message,
            "created_at": datetime.utcnow()
        }
        self.chat_repository.create(chat_data)

        return response_message

    def get_chats_by_user(self, user_id: str):
            # Retrieve all chats for the user, sorted by created_at in descending order
            return self.chat_repository.get_chats_by_user(user_id)
    
    def clear_chats_by_user(self, user_id: str):
        # Clear all chats for the user
        self.chat_repository.clear_chats_by_user(user_id)

    def delete_chat_by_message_id(self, user_id: str, chat_id: str):
        # Fetch message with ID and verify it belongs to the user
        chat = self.chat_repository.get_chat_by_message_id(chat_id)
        if not chat:
            raise ValueError("Message does not exist. Please provide a valid message ID.")
        elif chat["user_id"] != user_id:
            raise ValueError("Chat does not belong to the user. Please ensure you are deleting your own messages.")
        
        # Delete a specific chat by its ID
        self.chat_repository.delete_chat_by_id(chat_id)