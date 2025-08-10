from core.env import env

class MNMLAIConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        config = {
            "api_key": self.env.get("MNMLAI_API_KEY"),
            "base_url": "https://api.mnmlai.dev",
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

mnmlai_config = MNMLAIConfig()