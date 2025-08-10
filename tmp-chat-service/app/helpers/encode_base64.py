import base64
from fastapi import UploadFile

class Base64Encoder:
    @staticmethod
    async def encode_image_to_base64(image: UploadFile) -> str:
        contents = await image.read()
        base64_encoded = base64.b64encode(contents).decode("utf-8")
        return f"data:{image.content_type};base64,{base64_encoded}"