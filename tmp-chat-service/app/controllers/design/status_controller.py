# app/controllers/design/status_controller.py

import requests
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

    # Get the status ID from the request path parameters
    status_id = request.path_params.get("id")
    if not status_id:
        return FormatHelper.format_response(
            "error",
            400,
            "Status ID is missing",
            None,
            None
        )

    # Call design service to fetch status
    design_service = container.resolve("services.design_service")
    try:
        response = design_service.status_check(status_id)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to fetch status",
            None,
            None
        )

    # Return the response from the external API
    return FormatHelper.format_response(
        "success",
        200,
        "Status retrieved successfully",
        response,
        None
    )