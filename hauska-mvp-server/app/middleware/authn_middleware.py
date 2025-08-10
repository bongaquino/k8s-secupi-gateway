from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.helpers.format_helper import FormatHelper

class AuthnMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, container):
        super().__init__(app)
        self.token_service = container.resolve("services.token_service")

    async def dispatch(self, request: Request, call_next):
        # Extract the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content=FormatHelper.format_response(
                    "error",
                    401,
                    "Missing or invalid Authorization header",
                    None,
                    None
                )
            )

        # Extract the token
        token = auth_header.split("Bearer ")[1]

        # Validate the token
        try:
            self.token_service.validate_token(token)
        except Exception as e:
            return JSONResponse(
                status_code=401,
                content=FormatHelper.format_response(
                    "error",
                    401,
                    "Token is expired or invalid",
                    None,
                    None
                )
            )

        # Proceed to the next middleware or route handler
        response = await call_next(request)
        return response