from core.env import env

class OpenAIConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        config = {
            "api_key": self.env.get("OPENAI_API_KEY"),
            "model_id": self.env.get("OPENAI_MODEL_ID"),
            "max_tokens": 100,
            "temperature": 0.7,
            "base_url": "https://api.perplexity.ai",
            "system_prompt": self.env.get("OPENAI_SYSTEM_PROMPT")
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

openai_config = OpenAIConfig()