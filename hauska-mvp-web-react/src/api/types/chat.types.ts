export interface Message {
  id: string;
  query_message?: string;
  response_message?: string;
  role: "user" | "assistant";
  created_at: string;
  user_id: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  status: string;
  message: string;
  data: {
    response: string;
  };
  meta: null;
}

export interface ListMessagesResponse {
  status?: string;
  message?: string;
  data: {
    chats: Message[];
  };
}
