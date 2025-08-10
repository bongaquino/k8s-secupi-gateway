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

    # Get message ID from request path parameters
    message_id = request.path_params.get("message_id")
    if not message_id:
        return FormatHelper.format_response(
            "error",
            400,
            "Missing message ID in request body",
            None,
            None
            )

    # Use ChatService to retrieve chats
    chat_service = container.resolve("services.chat_service")
    try:
        chat_service.delete_chat_by_message_id(user_id, message_id)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to delete message for message ID {message_id}: {str(e)}",
            None,
            None
        )

    return FormatHelper.format_response(
        "success",
        200,
        "Message deleted successfully",
        None,
        None
    )