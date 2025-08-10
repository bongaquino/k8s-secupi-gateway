from app.providers.mongo_provider import mongo_provider

def run_migrations():
    db = mongo_provider.db

    # Create "users" collection with an index on the "email" field
    if "users" not in db.list_collection_names():
        print("Creating 'users' collection...")
        db.create_collection("users")
        print("'users' collection created.")

    print("Creating index on 'email' field in 'users' collection...")
    db["users"].create_index("email", unique=True)
    print("Index on 'email' field created.")

    # Create "profiles" collection with an index on the "user_id" field
    if "profiles" not in db.list_collection_names():
        print("Creating 'profiles' collection...")
        db.create_collection("profiles")
        print("'profiles' collection created.")
    print("Creating index on 'user_id' field in 'profiles' collection...")
    db["profiles"].create_index("user_id", unique=True)
    print("Index on 'user_id' field created.")

    # Create "chats" collection with an index on the "user_id" field
    if "chats" not in db.list_collection_names():
        print("Creating 'chats' collection...")
        db.create_collection("chats")
        print("'chats' collection created.")
    print("Creating index on 'user_id' field in 'chats' collection...")
    db["chats"].create_index("user_id")
    print("Index on 'user_id' field created.")

    print("Migrations completed successfully.")