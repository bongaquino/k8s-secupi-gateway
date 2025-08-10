from fastapi import FastAPI
from core.container import load_container, get_container
from start.kernel import initialize_kernel

# Create a FastAPI instance
app = FastAPI()

# Load the container
load_container()
container = get_container()

# Register middleware and routes
initialize_kernel(app, container)