from fastapi import FastAPI, APIRouter, Depends, Request
from core.container import Container
from app.middleware.authn_middleware import AuthnMiddleware

# Create routers
router = APIRouter()
user_router = APIRouter(prefix="/users")
token_router = APIRouter(prefix="/tokens")
profile_router = APIRouter(prefix="/profiles")
chat_router = APIRouter(prefix="/chats")
design_router = APIRouter(prefix="/design")

# Dependency for authentication
async def auth_dependency(request: Request, container: Container = Depends()):
    auth_middleware = AuthnMiddleware(app=None, container=container)
    await auth_middleware.dispatch(request, lambda req: None)
    return request

def register_routes(app: FastAPI, container: Container):
    # Public routes
    @router.get("/")
    async def health_check(request: Request):
        return await container.resolve("controllers.health.check_controller")(request, container)

    @router.get("/health/check")
    async def health_check_redirect(request: Request):
        return await health_check(request)

    @user_router.post("/register")
    async def register_user(request: Request):
        return await container.resolve("controllers.users.register_controller")(request, container)
    
    @token_router.post("/request")
    async def request_token(request: Request):
        return await container.resolve("controllers.tokens.request_controller")(request, container)

    # Protected routes
    @token_router.delete("/revoke", dependencies=[Depends(auth_dependency)])
    async def revoke_token(request: Request):
        return await container.resolve("controllers.tokens.revoke_controller")(request, container)
    
    @profile_router.get("/me", dependencies=[Depends(auth_dependency)])
    async def get_profile(request: Request):
        return await container.resolve("controllers.profiles.me_controller")(request, container)

    @profile_router.put("/update", dependencies=[Depends(auth_dependency)])
    async def update_profile(request: Request):
        return await container.resolve("controllers.profiles.update_controller")(request, container)
    
    @user_router.put("/change-password", dependencies=[Depends(auth_dependency)])
    async def change_password(request: Request):
        return await container.resolve("controllers.users.change_password_controller")(request, container)
    
    @chat_router.post("/send-message", dependencies=[Depends(auth_dependency)])
    async def send_message(request: Request):
        return await container.resolve("controllers.chats.send_message")(request, container)

    @chat_router.get("/list-messages", dependencies=[Depends(auth_dependency)])
    async def list_chats(request: Request):
        return await container.resolve("controllers.chats.list_messages")(request, container)
    
    @chat_router.delete("/clear-messages", dependencies=[Depends(auth_dependency)])
    async def clear_messages(request: Request):
        return await container.resolve("controllers.chats.clear_messages")(request, container)
    
    @chat_router.delete("/delete-message/{message_id}", dependencies=[Depends(auth_dependency)])
    async def delete_message(request: Request):
        return await container.resolve("controllers.chats.delete_message")(request, container)

    @design_router.get("/status/{id}", dependencies=[Depends(auth_dependency)])
    async def design_status(request: Request):
        return await container.resolve("controllers.design.status_controller")(request, container)
    
    @design_router.post("/interior", dependencies=[Depends(auth_dependency)])
    async def interior_design(request: Request):
        return await container.resolve("controllers.design.interior_controller")(request, container)
    
    @design_router.post("/exterior", dependencies=[Depends(auth_dependency)])
    async def exterior_design(request: Request):
        return await container.resolve("controllers.design.exterior_controller")(request, container)
    
    @design_router.post("/render-enhancer", dependencies=[Depends(auth_dependency)])
    async def render_enhancer(request: Request):
        return await container.resolve("controllers.design.render_enhancer_controller")(request, container)
    
    @design_router.post("/style-transfer", dependencies=[Depends(auth_dependency)])
    async def style_transfer(request: Request):
        return await container.resolve("controllers.design.style_transfer_controller")(request, container)
    
    @design_router.post("/virtual-staging", dependencies=[Depends(auth_dependency)])
    async def virtual_staging(request: Request):
        return await container.resolve("controllers.design.virtual_staging_controller")(request, container)

    # Include routers
    app.include_router(router)
    app.include_router(user_router)
    app.include_router(token_router)
    app.include_router(profile_router)
    app.include_router(chat_router)
    app.include_router(design_router)