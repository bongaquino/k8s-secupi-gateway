import redis
from config.redis import redis_config

class RedisProvider:
    def __init__(self):
        self.host = redis_config.get("redis_host")
        self.port = redis_config.get("redis_port")
        self.password = redis_config.get("redis_password")
        self.client = self.connect()

    def connect(self):
        return redis.Redis(
            host=self.host,
            port=self.port,
            password=self.password,
            decode_responses=True
        )

    def set(self, key, value, ex=None):
        return self.client.set(key, value, ex=ex)

    def get(self, key):
        return self.client.get(key)

    def delete(self, key):
        return self.client.delete(key)