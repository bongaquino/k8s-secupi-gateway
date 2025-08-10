from fastapi import Request
from config.app import app_config
from app.helpers.format_helper import FormatHelper

async def handle(request: Request, container):
    return FormatHelper.format_response(
        "success",
        200,
        "Health check successful",
        {
            "name": app_config.get("app_name"),
            "version": app_config.get("app_version"),
            "healthy": True
        },
        None
    )