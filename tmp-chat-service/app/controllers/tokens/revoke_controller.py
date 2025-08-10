from fastapi import Request, HTTPException
from app.helpers.format_helper import FormatHelper

async def handle(request: Request, container):
    try:
        # Extract token from the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=400, detail="Missing or invalid Authorization header")
        token = auth_header.split("Bearer ")[1]
    except Exception:
        return FormatHelper.format_response(
            "error",
            400,
            "Missing or invalid Authorization header",
            None,
            None
        )

    # Resolve RedisProvider to check if the token is already revoked
    redis_provider = container.resolve("providers.redis_provider")
    if redis_provider.get(f"revoked_token:{token}"):
        return FormatHelper.format_response(
            "error",
            400,
            "Token is expired or invalid",
            None,
            None
        )

    # Resolve TokenService and revoke the token
    token_service = container.resolve("services.token_service")
    try:
        token_service.revoke_token(token)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to revoke token: {str(e)}",
            None,
            None
        )

    return FormatHelper.format_response(
        "success",
        200,
        "Token revoked successfully",
        None,
        None
    )