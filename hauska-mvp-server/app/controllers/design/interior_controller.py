# app/controllers/design/interior_controller.py

from fastapi import Request, UploadFile, Form
from core.container import get_container
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
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            401,
            "Token is expired or invalid",
            None,
            None
        )

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
    else:
        return FormatHelper.format_response(
            "error",
            400,
            f"Unsupported Content-Type: {content_type}",
            None,
            None
        )

    image: UploadFile = form_data.get('image')
    prompt = form_data.get('prompt', "")
    image_type = form_data.get('imageType', "")
    scenario = form_data.get('scenario', "")
    geometry_input = form_data.get('geometry_input', "")
    styles = form_data.get('styles', "")
    renderspeed = form_data.get('renderspeed', "")
    negative_prompt = form_data.get('negative_prompt', "")
    geometry = form_data.get('geometry', "")
    creativity = form_data.get('creativity', "")
    dynamic = form_data.get('dynamic', "")
    sharpen = form_data.get('sharpen', "")
    seed = form_data.get('seed', "")

    # Validate that the image file is present in the form data
    if not image:
        return FormatHelper.format_response(
            "error",
            400,
            "Image file is missing",
            None,
            None
        )
    
    # Validate prompt is not empty
    if not prompt:
        return FormatHelper.format_response(
            "error",
            400,
            "Prompt is missing",
            None,
            None
        )
    
    # Prepare the files payload for the API call
    files = {'image': image.file}

    # Prepare the data payload for the API call
    data = {
        'prompt': prompt,
        'imageType': image_type,
        'scenario': scenario,
        'geometry_input': geometry_input,
        'styles': styles,
        'renderspeed': renderspeed,
        'negative_prompt': negative_prompt,
        'geometry': geometry,
        'creativity': creativity,
        'dynamic': dynamic,
        'sharpen': sharpen,
        'seed': seed
    }
    
    # Resolve MnmlaiProvider from the container
    design_service = container.resolve("services.design_service")
    
    try:
        response = design_service.interior_ai(
            files=files,
            data=data
        )
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to generate interior design: {str(e)}",
            None,
            None
        )
    
    return FormatHelper.format_response(
        "success", 
        200, 
        "Success", 
        response, 
        None)