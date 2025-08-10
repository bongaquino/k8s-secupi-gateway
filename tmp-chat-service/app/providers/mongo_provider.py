from pymongo import MongoClient
from pymongo.server_api import ServerApi
from config.mongo import mongo_config

class MongoProvider:
    def __init__(self):
        self.host = mongo_config.get("mongo_host")
        self.port = mongo_config.get("mongo_port")
        self.username = mongo_config.get("mongo_user")
        self.password = mongo_config.get("mongo_password")
        self.db_name = mongo_config.get("mongo_database")
        self.connection_string = mongo_config.get("mongo_connection_string")
        self.client = self.connect()
        self.db = self.client[self.db_name]

    def connect(self):
        if self.connection_string != "":
            return MongoClient(self.connection_string, server_api=ServerApi('1'))
        else:
            return MongoClient(
                host=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                authSource=self.db_name, # Adjust this if you are using a different authentication database
            )

    def get_collection(self, collection_name):
        return self.db[collection_name]

mongo_provider = MongoProvider()