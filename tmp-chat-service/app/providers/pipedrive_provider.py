from config.pipedrive import openai_config
import requests

class PipeDriveProvider:
    def __init__(self):
        self.api_key = openai_config.get("api_key")
        self.api_url = openai_config.get("api_url")
        self.pipeline_id = openai_config.get("pipeline_id")
        self.stage_id = openai_config.get("stage_id")

    def add_user_and_create_deal(self, user, profile):
        # Add user to PipeDrive
        url_person = f"{self.api_url}/persons?api_token={self.api_key}"
        name = f"{profile.first_name} {profile.last_name}"
        person_payload = {
            "name": name,
            "email": user.email,
            "phone": profile.phone_number,
            openai_config.get("company_name_key"): profile.company_name,
            openai_config.get("industry_association_key"): profile.industry_association,
            openai_config.get("is_student_key"): "Yes" if profile.is_student else "No"
        }
        print(person_payload)
        person_response = requests.post(url_person, json=person_payload)
        if person_response.status_code != 201:
            raise Exception(f"Failed to add user to PipeDrive ({person_response.text})")

        # Extract person_id from the response
        person_id = person_response.json().get("data", {}).get("id")
        if not person_id:
            raise Exception("Failed to retrieve person ID from PipeDrive response")

        # Create a deal for the user
        url_deal = f"{self.api_url}/deals?api_token={self.api_key}"
        deal_payload = {
            "title": name,
            "person_id": person_id,
            "pipeline_id": self.pipeline_id,
            "stage_id": self.stage_id,
        }
        deal_response = requests.post(url_deal, json=deal_payload)
        if deal_response.status_code != 201:
            raise Exception(f"Failed to create deal in PipeDrive ({deal_response.text})")