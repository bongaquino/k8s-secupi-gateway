# start/env.py
from dotenv import load_dotenv
import os

class Env:
    def __init__(self):
        load_dotenv()
        self.env = self.validate_env()

    def validate_env(self):
        required_vars = [
            "APP_NAME",
            "APP_VERSION",
            "APP_KEY",
            "DEBUG",
            "PORT",
            "MONGO_HOST",
            "MONGO_PORT",
            "MONGO_USER",
            "MONGO_PASSWORD",
            "MONGO_DATABASE",
            "MONGO_CONNECTION_STRING",
            "REDIS_HOST",
            "REDIS_PORT",
            "REDIS_PASSWORD",
            "OPENAI_API_KEY",
            "OPENAI_MODEL_ID",
            "OPENAI_SYSTEM_PROMPT",
            "PIPEDRIVE_API_KEY",
            "PIPEDRIVE_API_URL",
            "PIPEDRIVE_PIPELINE_ID",
            "PIPEDRIVE_STAGE_ID",
            "MNMLAI_API_KEY"
        ]
        env_vars = {var: os.getenv(var) for var in required_vars}
        for var, value in env_vars.items():
            if value is None:
                raise EnvironmentError(f"Missing required environment variable: {var}")
        return env_vars

env = Env().env
