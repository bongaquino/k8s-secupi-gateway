from fastapi import Request
from app.models.user import User
from app.models.profile import Profile
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

    # Divide the data into User and Profile
    user_data = {
        "email": request_body["email"],
        "password": request_body["password"]
    }
    profile_data = {
        "first_name": request_body["first_name"],
        "middle_name": request_body.get("middle_name"),
        "last_name": request_body["last_name"],
        "suffix": request_body.get("suffix"),
        "company_name": request_body.get("company_name"),
        "phone_number": request_body.get("phone_number"),
        "industry_association": request_body.get("industry_association"),
        "is_student": request_body.get("is_student")
    }

    # Create the User instance
    user = User(**user_data)

    # Resolve the UserService and register the user
    user_service = container.resolve("services.user_service")
    try:
        user_id = user_service.register_user(user)
    except Exception as e:
        if "already exists" in str(e):
            return FormatHelper.format_response(
                "error",
                409,  # HTTP 409 Conflict
                "User with this email already exists",
                None,
                None
            )
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to register user: {str(e)}",
            None,
            None
        )

    # Add the user_id to the profile data and create the Profile instance
    profile_data["user_id"] = user_id
    profile = Profile(**profile_data)

    # Resolve the ProfileService and save the profile
    profile_service = container.resolve("services.profile_service")
    try:
        profile_id = profile_service.create_profile(profile)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to create profile: {str(e)}",
            None,
            None
        )

    # Add the user to PipeDrive
    try:
        user_service.add_user_and_create_deal(user, profile)
    except Exception as e:
        return FormatHelper.format_response(
            "error",
            500,
            f"Failed to add user to PipeDrive: {str(e)}",
            None,
            None
        )

    return FormatHelper.format_response(
        "success",
        201,
        "User registered successfully",
        {"user_id": user_id, "profile_id": profile_id},
        None
    )

def validate_payload(payload: dict):
    required_user_fields = ["email", "password"]
    required_profile_fields = ["first_name", "last_name"]

    missing_fields = [
        field for field in required_user_fields + required_profile_fields if field not in payload
    ]

    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"

    # Validate industry_association
    valid_industry_associations = [
        "American Institute of Building Design (AIBD)",
        "Architecture & Design",
        "Engineering",
        "Construction",
        "Development & Real Estate",
        "Fabrication & Manufacturing",
        "Technology & Innovation",
        "Education & Student Track",
        "FB Residential Design Professionals Group"
    ]

    if "industry_association" in payload and payload["industry_association"] not in valid_industry_associations:
        return f"Invalid industry_association. Must be one of: {', '.join(valid_industry_associations)}"

    return None