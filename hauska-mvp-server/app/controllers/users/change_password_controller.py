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

    # Parse the request body
    request_body = await request.json()

    # Validate the request data
    validation_error = validate_payload(request_body)
    if validation_error:
        return FormatHelper.format_response(
            "error",
            400,
            validation_error,
            None,
            None
        )

    old_password = request_body["old_password"]
    new_password = request_body["new_password"]

    # Resolve UserService to handle password change
    user_service = container.resolve("services.user_service")
    try:
        user_service.change_password(user_id, old_password, new_password)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            400,
            str(e),
            None,
            None
        )

    return FormatHelper.format_response(
        "success",
        200,
        "Password changed successfully",
        None,
        None
    )

def validate_payload(payload: dict):
    required_fields = ["old_password", "new_password"]

    missing_fields = [field for field in required_fields if field not in payload]

    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    return None