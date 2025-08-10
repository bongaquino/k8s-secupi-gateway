from app.models.profile import Profile
from app.repositories.profile_repository import ProfileRepository

class ProfileService:
    def __init__(self, profile_repository: ProfileRepository):
        self.profile_repository = profile_repository

    def create_profile(self, profile: Profile):
        # Save the profile to the database
        return self.profile_repository.create(profile)

    def get_profile(self, profile_id: str):
        # Retrieve a profile by ID
        return self.profile_repository.read(profile_id)
    
    def get_profile_by_user_id(self, user_id: str):
        # Retrieve a profile by user ID
        return self.profile_repository.read_by_user_id(user_id)

    def update_profile(self, profile_id: str, profile: Profile):
        # Update an existing profile
        self.profile_repository.update(profile_id, profile)

    def update_profile_by_user_id(self, user_id: str, profile: Profile):
        # Update a profile by user ID
        self.profile_repository.update_by_user_id(user_id, profile)

    def delete_profile(self, profile_id: str):
        # Delete a profile by ID
        self.profile_repository.delete(profile_id)