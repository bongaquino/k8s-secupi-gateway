from fastapi import Request
from app.helpers.format_helper import FormatHelper

async def handle(request: Request, container):
    # Extract the token from the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return FormatHelper.format_response(
            "error",
            401,
            "Missing or invalid Authorization header",
            None,
            None
        )

    token = auth_header.split("Bearer ")[1]

    # Resolve TokenService to decode the token
    token_service = container.resolve("services.token_service")
    try:
        token_data = token_service.validate_token(token)
    except Exception:
        return FormatHelper.format_response(
            "error",
            401,
            "Token is expired or invalid",
            None,
            None
        )

    # Extract user_id from the token
    user_id = token_data.get("user_id")

    # Resolve UserService to get user details
    user_service = container.resolve("services.user_service")
    user = user_service.get_user_by_id(user_id)
    if not user:
        return FormatHelper.format_response(
            "error",
            404,
            "User not found",
            None,
            None
        )

    # Resolve ProfileService to get profile details
    profile_service = container.resolve("services.profile_service")
    profile = profile_service.get_profile_by_user_id(user_id)
    if not profile:
        return FormatHelper.format_response(
            "error",
            404,
            "Profile not found",
            None,
            None
        )

    # Return user and profile details
    return FormatHelper.format_response(
        "success",
        200,
        "Profile retrieved successfully",
        {
            "email": user.email,
            "profile": profile.dict()
        },
        None
    )