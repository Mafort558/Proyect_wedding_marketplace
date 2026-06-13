from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.models.entities import User
from app.models.enums import UserRole
from app.repositories.provider_repository import ProviderRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import ChangePasswordRequest, LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, repository: UserRepository, provider_repository: ProviderRepository):
        self._repository = repository
        self._provider_repository = provider_repository

    async def register(self, request: RegisterRequest) -> UserResponse:
        existing_user = await self._repository.get_by_email(request.email)
        if existing_user is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        user = await self._repository.create(
            email=request.email,
            password_hash=hash_password(request.password),
            full_name=request.full_name,
            role=request.role,
        )
        if request.role == UserRole.PROVIDER:
            await self._provider_repository.create(user.id, request.business_name, request.category)
        return UserResponse.model_validate(user)

    async def login(self, request: LoginRequest) -> TokenResponse:
        user = await self._repository.get_by_email(request.email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return TokenResponse(access_token=create_access_token(user.id, user.role))

    async def change_password(self, user: User, request: ChangePasswordRequest) -> None:
        if not verify_password(request.current_password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
        await self._repository.update_password(user, hash_password(request.new_password))
