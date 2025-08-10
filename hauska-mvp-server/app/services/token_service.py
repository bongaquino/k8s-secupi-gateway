from datetime import datetime, timedelta

class TokenService:
    def __init__(self, jwt_provider, redis_provider):
        self.jwt_provider = jwt_provider
        self.redis_provider = redis_provider

    def generate_token(self, user_id: str) -> str:
        payload = {"user_id": user_id}
        return self.jwt_provider.encode(payload)

    def validate_token(self, token: str) -> dict:
        # Check if the token is blacklisted
        if self.redis_provider.get(f"revoked_token:{token}"):
            raise Exception("Token has been revoked")
        return self.jwt_provider.decode(token)

    def revoke_token(self, token: str, expires_in: int = 86400):
        # Store the token in Redis with an expiration time
        self.redis_provider.set(f"revoked_token:{token}", "revoked", ex=expires_in)