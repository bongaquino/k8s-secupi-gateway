from core.env import env

class RedisConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        config = {
            "redis_host": self.env.get("REDIS_HOST", "redis"),
            "redis_port": self.env.get("REDIS_PORT", 6379),
            "redis_password": self.env.get("REDIS_PASSWORD", ""),
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

redis_config = RedisConfig()