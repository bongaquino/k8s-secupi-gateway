from fastapi import Request
from app.helpers.format_helper import FormatHelper

async def handle(request: Request, container):
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

    email = request_body["email"]
    password = request_body["password"]

    # Resolve UserService to validate credentials
    user_service = container.resolve("services.user_service")
    user = user_service.authenticate_user(email, password)

    if not user:
        return FormatHelper.format_response(
            "error",
            401,
            "Invalid email or password",
            None,
            None
        )

    # Generate token for the authenticated user
    token_service = container.resolve("services.token_service")
    try:
        token = token_service.generate_token(user_id=user.id)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to generate token: {str(e)}",
            None,
            None
        )

    return FormatHelper.format_response(
        "success",
        200,
        "Token generated successfully",
        {"token": token},
        None
    )
    request_body = await request.json()

    # Validate the request data
    validate_payload(request_body)

    email = request_body["email"]
    password = request_body["password"]

    # Resolve UserService to validate credentials
    user_service = container.resolve("services.user_service")
    user = user_service.authenticate_user(email, password)

    if not user:
        raise UnauthorizedException("Invalid email or password")

    # Generate token for the authenticated user
    token_service = container.resolve("services.token_service")
    token = token_service.generate_token(user_id=user.id)

    return FormatHelper.format_response(
        "success",
        200,
        "Token generated successfully",
        {"token": token},
        None
    )

def validate_payload(payload: dict):
    required_fields = ["email", "password"]

    missing_fields = [field for field in required_fields if field not in payload]

    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    return None