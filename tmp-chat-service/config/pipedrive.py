from core.env import env

class PipeDriveConfig:
    def __init__(self):
        self.env = env
        self.config = self.load_config()

    def load_config(self):
        config = {
            "api_key": self.env.get("PIPEDRIVE_API_KEY"),
            "api_url": self.env.get("PIPEDRIVE_API_URL"),
            "pipeline_id": self.env.get("PIPEDRIVE_PIPELINE_ID"),
            "stage_id": self.env.get("PIPEDRIVE_STAGE_ID"),
            "company_name_key": "bcffac742678fafde08586f2969fa2c33bdfff81",
            "industry_association_key": "abb316eeefb3014580ca2d70adeebe8aa6922ba6",
            "is_student_key": "f69f6286569d06d47150eee235031231010e9927",
        }
        return config

    def get(self, key, default=None):
        return self.config.get(key, default)

openai_config = PipeDriveConfig()