from typing import Dict, Any, Callable

class Container:
    def __init__(self):
        self._services: Dict[str, Any] = {}

    def register(self, name: str, service: Callable):
        self._services[name] = service

    def resolve(self, name: str) -> Any:
        return self._services.get(name)

container = Container()

def load_container():
    # Import providers
    from app.providers.redis_provider import RedisProvider
    from app.providers.mongo_provider import MongoProvider
    from app.providers.openai_provider import OpenAIProvider
    from app.providers.jwt_provider import JWTProvider
    from app.providers.pipedrive_provider import PipeDriveProvider
    from app.providers.mnmlai_provider import MNMLAIProvider

    # Register providers
    redis_provider = RedisProvider()
    mongo_provider = MongoProvider()
    openai_provider = OpenAIProvider()
    jwt_provider = JWTProvider()
    pipedrive_provider = PipeDriveProvider()
    mnmlai_provider = MNMLAIProvider()
    container.register("providers.redis_provider", redis_provider)
    container.register("providers.mongo_provider", mongo_provider)
    container.register("providers.openai_provider", openai_provider)
    container.register("providers.jwt_provider", jwt_provider)
    container.register("providers.pipedrive_provider", pipedrive_provider)
    container.register("providers.mnmlai_provider", mnmlai_provider)

    # Import repositories
    from app.repositories.user_repository import UserRepository
    from app.repositories.profile_repository import ProfileRepository
    from app.repositories.chat_repository import ChatRepository

    # Register repositories
    user_repository = UserRepository(mongo_provider)
    profile_repository = ProfileRepository(mongo_provider)
    chat_repository = ChatRepository(mongo_provider)
    container.register("repositories.user_repository", user_repository)
    container.register("repositories.profile_repository", profile_repository)
    container.register("repositories.chat_repository", chat_repository)

    # Import services
    from app.services.user_service import UserService
    from app.services.profile_service import ProfileService
    from app.services.token_service import TokenService
    from app.services.chat_service import ChatService
    from app.services.design_service import DesignService

    # Register services
    user_service = UserService(user_repository, pipedrive_provider)
    profile_service = ProfileService(profile_repository)
    token_service = TokenService(jwt_provider, redis_provider)
    llm_service = ChatService(chat_repository, openai_provider)
    design_service = DesignService(mnmlai_provider)
    container.register("services.user_service", user_service)
    container.register("services.profile_service", profile_service)
    container.register("services.llm_service", llm_service)
    container.register("services.token_service", token_service)
    container.register("services.chat_service", llm_service)
    container.register("services.design_service", design_service)

    # Import middleware

    # Register middleware

    # Import controllers
    from app.controllers.health.check_controller import handle as health_check_handler
    from app.controllers.users.register_controller import handle as user_register_handler
    from app.controllers.users.change_password_controller import handle as change_password_handler
    from app.controllers.tokens.request_controller import handle as token_request_handler
    from app.controllers.tokens.revoke_controller import handle as token_revoke_handler
    from app.controllers.profiles.me_controller import handle as profile_me_handler
    from app.controllers.profiles.update_controller import handle as profile_update_handler
    from app.controllers.chats.send_message import handle as chat_message_handler
    from app.controllers.chats.list_messages import handle as chat_list_handler
    from app.controllers.chats.clear_messages import handle as chat_clear_handler
    from app.controllers.chats.delete_message import handle as chat_delete_handler
    from app.controllers.design.status_controller import handle as design_status_handler
    from app.controllers.design.interior_controller import handle as interior_design_handler
    from app.controllers.design.exterior_controller import handle as exterior_design_handler
    from app.controllers.design.render_enhancer_controller import handle as render_enhancer_handler
    from app.controllers.design.style_transfer_controller import handle as style_transfer_handler
    from app.controllers.design.virtual_staging_controller import handle as virtual_staging_handler

    # Register controllers
    container.register("controllers.health.check_controller", health_check_handler)
    container.register("controllers.users.register_controller", user_register_handler)
    container.register("controllers.users.change_password_controller", change_password_handler)
    container.register("controllers.tokens.request_controller", token_request_handler)
    container.register("controllers.tokens.revoke_controller", token_revoke_handler)
    container.register("controllers.profiles.me_controller", profile_me_handler)
    container.register("controllers.profiles.update_controller", profile_update_handler)
    container.register("controllers.chats.send_message", chat_message_handler)
    container.register("controllers.chats.list_messages", chat_list_handler)
    container.register("controllers.chats.clear_messages", chat_clear_handler)
    container.register("controllers.chats.delete_message", chat_delete_handler)
    container.register("controllers.design.status_controller", design_status_handler)
    container.register("controllers.design.interior_controller", interior_design_handler)
    container.register("controllers.design.exterior_controller", exterior_design_handler)
    container.register("controllers.design.render_enhancer_controller", render_enhancer_handler)
    container.register("controllers.design.style_transfer_controller", style_transfer_handler)
    container.register("controllers.design.virtual_staging_controller", virtual_staging_handler)

    # Run migrations
    from database.migrations import run_migrations
    run_migrations()

    # Run seeders
    from database.seeders import run_seeders
    run_seeders()

def get_container() -> Container:
    return container