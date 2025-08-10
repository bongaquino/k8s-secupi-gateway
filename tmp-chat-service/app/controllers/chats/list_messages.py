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

    # Use ChatService to retrieve chats
    chat_service = container.resolve("services.chat_service")
    try:
        chats = chat_service.get_chats_by_user(user_id)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to retrieve chats: {str(e)}",
            None,
            None
        )

    return FormatHelper.format_response(
        "success",
        200,
        "Chats retrieved successfully",
        {"chats": chats},
        None
    )