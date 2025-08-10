from app.models.user import User
from app.models.profile import Profile
from app.helpers.hash_helper import HashHelper
from app.providers.pipedrive_provider import PipeDriveProvider

class UserService:
    def __init__(self, user_repository, pipedrive_provider: PipeDriveProvider):
        self.user_repository = user_repository
        self.pipedrive_provider = pipedrive_provider

    def register_user(self, user: User):
        # Check if the user already exists
        existing_user = self.user_repository.find_by_email(user.email)
        if existing_user:
            raise Exception("User with this email already exists")

        # Hash the user's password before saving
        user.password = HashHelper.hash_data(user.password)
        
        # Save the user to the database
        user_id = self.user_repository.create(user)

        # Return the user ID
        return user_id

    def authenticate_user(self, email: str, password: str):
        # Retrieve the user by email
        user = self.user_repository.find_by_email(email)
        if not user:
            return None  # Return None if the user is not found

        # Verify the password
        if not HashHelper.verify_hash(password, user.password):
            return None  # Return None if the password is incorrect

        return user

    def get_user_by_id(self, user_id: str):
            # Retrieve the user by ID
            return self.user_repository.read(user_id)

    def change_password(self, user_id: str, old_password: str, new_password: str):
            # Retrieve the user by ID
            user = self.user_repository.read(user_id)
            if not user:
                raise Exception("User not found")

            # Verify the old password
            if not HashHelper.verify_hash(old_password, user.password):
                raise Exception("Old password is incorrect")

            # Hash the new password
            hashed_new_password = HashHelper.hash_data(new_password)

            # Update the user's password
            user.password = hashed_new_password
            self.user_repository.update(user_id, user)

    def add_user_and_create_deal(self, user: User, profile: Profile):
        # Add the user to PipeDrive
        try:
            self.pipedrive_provider.add_user_and_create_deal(user, profile)
        except Exception as e:
            raise Exception(f"Failed to add user to PipeDrive: {str(e)}")
