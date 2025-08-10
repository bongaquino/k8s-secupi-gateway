import jwt
from datetime import datetime, timedelta
from config.app import app_config

class JWTProvider:
    def __init__(self):
        self.secret_key = app_config.get("app_key")
        self.algorithm = "HS256"

    def encode(self, payload: dict, expires_in: int = 86400) -> str: # Set default to 24 hours (86400 seconds)
        payload["exp"] = datetime.utcnow() + timedelta(seconds=expires_in)
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode(self, token: str) -> dict:
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])

jwt_provider = JWTProvider()