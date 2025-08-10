from core.env import env

class DeltaStorageConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        config = {
            "api_base_url": "https://api.delta.storage",
            "api_key": self.env.get("DELTA_API_KEY"),
            "directory_id": self.env.get("DELTA_DIRECTORY_ID"),
            "edge_base_url": "https://delta-edge.ardata.tech/gw"
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

delta_config = DeltaStorageConfig()