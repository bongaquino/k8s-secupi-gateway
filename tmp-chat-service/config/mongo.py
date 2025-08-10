from core.env import env

class MongoConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        config = {
            "mongo_host": self.env.get("MONGO_HOST", "mongo"),
            "mongo_port": int(self.env.get("MONGO_PORT", 27017)),
            "mongo_user": self.env.get("MONGO_USER", "arpy_user"),
            "mongo_password": self.env.get("MONGO_PASSWORD", "arpy_password"),
            "mongo_database": self.env.get("MONGO_DATABASE", "arpy"),
            "mongo_connection_string": self.env.get("MONGO_CONNECTION_STRING", ""),
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

mongo_config = MongoConfig()