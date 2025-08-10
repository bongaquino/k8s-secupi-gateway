import requests
from config.openai import openai_config

class OpenAIProvider:
    def __init__(self):
        self.api_key = openai_config.get("api_key")
        self.base_url = openai_config.get("base_url")
        self.model_id = openai_config.get("model_id")
        self.max_tokens = openai_config.get("max_tokens")
        self.temperature = openai_config.get("temperature")
        self.system_prompt = openai_config.get("system_prompt")

    def query(self, prompt: str, image=None):
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        if image is not None:
            message_content = [
                {
                    "type": "text",
                    "text": prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image
                    }
                }
            ]
        else:
            message_content = prompt

        # Append the system prompt to the messages list with a token limit notice
        system_prompt = self.system_prompt + f"\nLimit your response to a maximum of {self.max_tokens} tokens to avoid being cut off."

        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": message_content
            }
        ]

        payload = {
            "model": self.model_id,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }

        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"Perplexity API error: {response.status_code} - {response.text}")