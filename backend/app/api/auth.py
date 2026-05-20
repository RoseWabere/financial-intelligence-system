from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import TokenResponse, UserOut, UserRegister

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check uniqueness
    if payload.email:
        existing = (await db.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    if payload.phone:
        existing = (await db.execute(select(User).where(User.phone == payload.phone))).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Phone already registered")

    user = User(
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        age_bracket=payload.age_bracket,
        income_bracket=payload.income_bracket,
        risk_profile=payload.risk_profile,
        goals=payload.goals,
        investment_horizon_years=payload.investment_horizon_years,
    )
    db.add(user)
    await db.flush()
    return user


@router.post("/token", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # username field holds email or phone
    identifier = form.username
    user = None

    if "@" in identifier:
        user = (await db.execute(select(User).where(User.email == identifier))).scalar_one_or_none()
    else:
        user = (await db.execute(select(User).where(User.phone == identifier))).scalar_one_or_none()

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)
