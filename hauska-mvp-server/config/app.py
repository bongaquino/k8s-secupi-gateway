from core.env import env

class AppConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        # Load additional configuration values here
        config = {
            "app_name": self.env.get("APP_NAME"),
            "app_version": self.env.get("APP_VERSION"),
            "app_key": self.env.get("APP_KEY"),
            "debug": self.env.get("DEBUG") == "true",
            "port": int(self.env.get("PORT", 8080)),
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

app_config = AppConfig()