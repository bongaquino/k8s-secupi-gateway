from fastapi import Request, UploadFile
from app.helpers.format_helper import FormatHelper
from app.helpers.encode_base64 import Base64Encoder

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
    
    # Check content type and handle accordingly    
    content_type = request.headers.get('Content-Type')
    if content_type is None:
        return FormatHelper.format_response(
            "error",
            400,
            "Content-Type header is missing",
            None,
            None
        )
    elif (content_type == 'application/json'):
        # Parse the request body
        request_body = await request.json()
        query_message = request_body.get("message")

        # Use ChatService to process the message and save it
        chat_service = container.resolve("services.chat_service")
        try:
            response_message = chat_service.process_and_save_message(user_id, query_message)
        except Exception as e:
            return FormatHelper.format_response(
                "error",
                500,
                f"Failed to process message: {str(e)}",
                None,
                None
            )
    elif (content_type == 'application/x-www-form-urlencoded' or content_type.startswith('multipart/form-data')):
        try:
            form_data = await request.form()
        except Exception as e:
            return FormatHelper.format_response(
                "error",
                400,
                f"Failed to parse form data: {str(e)}",
                None,
                None
            )
        
        image: UploadFile = form_data.get('image')
        query_message = form_data.get('message', "")

        if not image:
            return FormatHelper.format_response(
                "error",
                400,
                "No image provided in the form data",
                None,
                None
            )
        
        # Check image must be image/png or image/jpeg or image/webp or image/gif only
        if image.content_type not in ['image/png', 'image/jpeg', 'image/webp', 'image/gif']:
            return FormatHelper.format_response(
                "error",
                400,
                "Invalid image format. Only PNG, JPEG, WEBP, and GIF are allowed.",
                None,
                None
            )
        
        # Convert image to base64 encoding
        base64_image = await Base64Encoder.encode_image_to_base64(image)

        # Use ChatService to process the message and save it
        chat_service = container.resolve("services.chat_service")
        try:
            response_message = chat_service.process_and_save_message(user_id, query_message, base64_image)
        except Exception as e:
            return FormatHelper.format_response(
                "error",
                500,
                f"Failed to process message: {str(e)}",
                None,
                None
            )
    else:
        return FormatHelper.format_response(
            "error",
            400,
            f"Unsupported Content-Type: {content_type}",
            None,
            None
        )
    
    return FormatHelper.format_response(
            "success",
            200,
            "Message processed successfully",
            {"response": response_message},
            None
        )

   