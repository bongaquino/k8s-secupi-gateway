from app.providers.mongo_provider import mongo_provider

def run_seeders():
    db = mongo_provider.db

    # # Example: Seed the "users" collection with an admin user
    # users_collection = db["users"]
    # if users_collection.count_documents({"email": "admin@example.com"}) == 0:
    #     print("Seeding admin user...")
    #     users_collection.insert_one({
    #         "email": "admin@example.com",
    #         "password": "$2b$12$hashedpasswordexample",  # Replace with a hashed password
    #     })
    #     print("Admin user seeded.")

    print("Seeders completed successfully.")