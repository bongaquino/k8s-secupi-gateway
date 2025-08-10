import bcrypt

class HashHelper:
    @staticmethod
    def hash_data(data: str) -> str:
        # Generate a salt
        salt = bcrypt.gensalt()
        # Hash the data with the salt
        hashed_data = bcrypt.hashpw(data.encode('utf-8'), salt)
        return hashed_data.decode('utf-8')

    @staticmethod
    def verify_hash(data: str, hashed_data: str) -> bool:
        # Verify the data against the hashed data
        return bcrypt.checkpw(data.encode('utf-8'), hashed_data.encode('utf-8'))