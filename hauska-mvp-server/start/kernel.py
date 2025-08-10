from fastapi import FastAPI
from start.routes import register_routes
from start.middleware import register_middleware
from core.container import Container

# Initialize the FastAPI kernel
def initialize_kernel(app: FastAPI, container: Container):
    register_routes(app, container)
    register_middleware(app, container)