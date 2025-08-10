from fastapi import FastAPI
from core.container import Container
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.authn_middleware import AuthnMiddleware

# Global middleware
def register_middleware(app: FastAPI, container: Container):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )