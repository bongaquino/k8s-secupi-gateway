from pydantic import BaseModel
from typing import Optional

class Profile(BaseModel):
    user_id: str
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    suffix: Optional[str] = None
    company_name: str
    phone_number: str
    industry_association: str
    is_student: bool