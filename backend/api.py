#!.venv/bin/python

# pylint: disable=broad-exception-caught

"""API Service"""

from contextlib import asynccontextmanager
from dataclasses import dataclass
from decimal import Decimal
from enum import CONTINUOUS, UNIQUE, IntEnum, auto, verify
from hashlib import sha256
from os import path
from pathlib import Path
from typing import TYPE_CHECKING, Annotated, ClassVar, Final, final

from anyio import to_thread
from cachetools import LRUCache, cached
from env import MAX_PORT, MIN_PORT, env  # pylint: disable=import-error
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from guard import SecurityConfig
from guard.middleware import SecurityMiddleware
from jwt import InvalidTokenError, decode
from nh3 import clean  # pylint: disable=no-name-in-module
from peewee import (
    AutoField,
    BooleanField,
    CharField,
    Check,
    DecimalField,
    ForeignKeyField,
    IntegerField,
)
from peewee import Model as DatabaseModel
from peewee import (
    SqliteDatabase,
)
from playhouse.shortcuts import model_to_dict
from playhouse.sqlite_ext import ISODateTimeField
from pluralizer import Pluralizer
from pydantic import (
    AwareDatetime,
)
from pydantic import BaseModel as ValidationModel
from pydantic import (
    ConfigDict,
    Field,
    PlainSerializer,
    StrictInt,
    StrictStr,
    TypeAdapter,
    ValidationError,
    field_validator,
    model_validator,
)
from rich.console import Console
from rich.traceback import install as catch_exceptions
from secure import ContentSecurityPolicy, Secure
from secure.middleware import SecureASGIMiddleware
from semver import Version
from uvicorn import run
from whenever import ZonedDateTime

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator
    from datetime import datetime

    from cachetools import _cached_wrapper_info, _CacheInfo
    from peewee import SQL, NodeList

CONSOLE: Final[Console] = Console()
catch_exceptions()

DEBUG: Final[bool] = env.SOBER_DEBUG

DB_PATH: Final[str] = env.SOBER_DB_PATH
DB_FILE: Final[str] = env.SOBER_DB_FILE
DB_STR: Final[str] = "./" + path.normpath(f"{DB_PATH}/{DB_FILE}")

if not DB_STR.startswith(DB_PATH):
    MSG: Final[str] = "Invalid DB path"
    raise ValueError(MSG)

DB: Final[SqliteDatabase] = SqliteDatabase(
    DB_STR,
    pragmas={
        "busy_timeout": 3000,
        "foreign_keys": True,
        "journal_mode": "WAL",
        "synchronous": "NORMAL",
        "wal_checkpoint": "TRUNCATE",
    },
)


MAX_LEN: Final[int] = 64

pluralizer: Final[Pluralizer] = Pluralizer()


def _shorten(user: str) -> str:
    """Return shortened SHA-256 string"""
    return user[:7]


class BaseModel(DatabaseModel):
    """Base database model"""

    @dataclass
    class Meta:
        """Metadata"""

        database: Final[SqliteDatabase] = DB


@verify(CONTINUOUS, UNIQUE)
class CostType(IntEnum):
    """CostType lookup"""

    DAY = auto()
    WEEK = auto()
    MONTH = auto()
    YEAR = auto()


def _get_datetime_now() -> datetime:
    """Get current UTC datetime"""
    return ZonedDateTime.now("UTC").to_stdlib()


@final
class User(BaseModel):
    """User database model"""

    created = ISODateTimeField(default=_get_datetime_now)
    id = AutoField()
    user = CharField(max_length=MAX_LEN, unique=True)

    @property
    def substances(self: User) -> list[Substance]:
        """Back reference"""
        return list(Substance.select().where(Substance.user == self.user))

    def __str__(self: User) -> str:
        """Show User data as string"""
        return f"user={_shorten(str(self.user))}, created={self.created}"

    def __repr__(self: User) -> str:
        """Show User data as string representation"""
        return str(self)


@final
class DecimalFieldToDecimal(DecimalField):
    """Convert to Decimal instead of str"""

    def python_value(self, value: str | Decimal | None) -> Decimal | None:
        """Convert to Decimal with two digits"""
        return (
            Decimal(value).quantize(Decimal("0.01")) if value is not None and not isinstance(value, Decimal) else value
        )


@final
class Substance(BaseModel):
    """Substance database model"""

    cost = DecimalFieldToDecimal(auto_round=True, decimal_places=2, default=Decimal)
    cost_type = IntegerField(default=CostType.DAY.value)
    created_at = ISODateTimeField(default=_get_datetime_now)
    date = ISODateTimeField(default=_get_datetime_now)
    id = AutoField()
    name = CharField(max_length=MAX_LEN, unique=True)
    show_coin = BooleanField(default=False)
    show_cost = BooleanField(default=False)
    show_decimals = BooleanField(default=True)
    show_time = BooleanField(default=True)
    updated_at = ISODateTimeField(default=_get_datetime_now)
    user = ForeignKeyField(User, backref="substances", field=User.user, on_delete="CASCADE")

    @dataclass
    class Meta:  # pyright: ignore [reportIncompatibleVariableOverride]
        """Constraints"""

        constraints: ClassVar[list[SQL | NodeList]] = [Check("NOT show_cost OR cost > 0")]

    def __str__(self: Substance) -> str:
        """Show Substance data as string"""
        return (
            f"name={self.name}, created_at={self.created_at}, updated_at={self.updated_at}, date={self.date}, "
            f"show_coin={self.show_coin}, show_cost={self.show_cost}, show_decimals={self.show_decimals}, "
            f"show_time={self.show_time}, cost={self.cost}, cost_type={CostType(self.cost_type)}"
        )

    def __repr__(self: Substance) -> str:
        """Show Substance data as string representation"""
        return str(self)


class BaseValidation(ValidationModel):
    """Base domain model"""

    model_config = ConfigDict(extra="ignore", validate_by_name=True, frozen=True)


type DecimalToFloat = Annotated[Decimal, PlainSerializer(float, return_type=float)]


@final
class SubstanceDTO(BaseValidation):
    """Substance domain model"""

    cost: DecimalToFloat = Field(decimal_places=2, ge=0.0)
    cost_type: StrictInt = Field(alias="costType", gt=0, le=len(CostType))
    date: AwareDatetime
    id: StrictInt | None = Field(gt=0, default=None)
    name: StrictStr = Field(max_length=MAX_LEN)
    show_coin: bool = Field(alias="showCoin")
    show_cost: bool = Field(alias="showCost")
    show_decimals: bool = Field(alias="showDecimals")
    show_time: bool = Field(alias="showTime")

    @classmethod
    @field_validator("name", mode="before")
    def sanitize_name(cls: type[SubstanceDTO], name: str) -> str:
        """Sanitize name"""
        return clean(name, tags=set()).replace("&amp;", "&")

    @classmethod
    @field_validator("date", mode="after")
    def date_lte(cls: type[SubstanceDTO], date: datetime) -> datetime:
        """Check date"""
        if date > _get_datetime_now():
            msg: Final[str] = "Date must be less than or equal to now"
            raise ValueError(msg)

        return date

    @model_validator(mode="after")
    def check_cost(self: SubstanceDTO) -> SubstanceDTO:
        """Check cost"""
        if self.show_cost and self.cost == 0:
            msg: Final[str] = "Cost must be greater than 0"
            raise ValueError(msg)

        return self

    def __str__(self: SubstanceDTO) -> str:
        """Show SubstanceDTO data as string"""
        return (
            f"name={self.name}, date={self.date}, "
            f"showCoin={self.show_coin}, showCost={self.show_cost}, showDecimals={self.show_decimals}, "
            f"showTime={self.show_time}, cost={self.cost}, costType={CostType(self.cost_type).name.title()}"
        )

    def __repr__(self: SubstanceDTO) -> str:
        """Show SubstanceDTO data as string representation"""
        return str(self)


def log(msg: str, info: str = "") -> None:
    """Log to console"""
    s: Final[str] = f"[bold green]{msg}[/bold green]"
    CONSOLE.log(s if not info else f"{s}: [cyan]{info}[/cyan]")


if not Path(DB_PATH).resolve().exists():
    if DEBUG:
        CONSOLE.print("📂 Creating path", DB_PATH)

    Path(DB_PATH).mkdir(parents=True)

if not Path(DB_STR).resolve().exists():
    if DEBUG:
        CONSOLE.print("🛢️  Creating database", DB_FILE)

    User.create_table()

    Substance.create_table()
elif DEBUG:
    CONSOLE.print("🛢️  Using database", DB_STR)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator:
    """Handle FastAPI lifespan"""
    CONSOLE.print("✨ Running local server…")

    if DEBUG:
        CONSOLE.print("🐞 Debug is ON")

    yield

    if DEBUG:
        CONSOLE.print("🛢️  Closing database")

    await to_thread.run_sync(DB.close)

    if DEBUG:
        CONSOLE.print("🛑 Stopping server")


ROUTER: Final[FastAPI] = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redoc_url="/redoc", lifespan=lifespan)
ROUTER.add_middleware(
    SecurityMiddleware,
    config=SecurityConfig(enable_redis=False, whitelist=("127.0.0.1",)),
)
ROUTER.add_middleware(
    SecureASGIMiddleware,
    secure=Secure(
        corp=None,
        csp=(
            ContentSecurityPolicy()
            .default_src("'self'")
            .font_src("'self'", "https://fonts.gstatic.com")
            .script_src("'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'")
            .style_src("'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "'unsafe-inline'")
            .img_src(
                "'self'",
                "data:",
                "https://cdn.jsdelivr.net",
                "https://fastapi.tiangolo.com",
                "https://cdn.redoc.ly",
            )
            .worker_src("'self'", "blob:")
        ),
    ),
)


API: Final[APIRouter] = APIRouter(prefix="/api")

NA: Final[str] = "N/A"

type Json = int | float | dict[str, Json] | list[str] | list[dict[str, Json]] | str | None


def _parse_cached_user(key: tuple) -> str | None:
    """Parse cached users"""
    try:
        return key[1][1]
    except IndexError:
        try:
            return key[0]
        except IndexError:
            return None


def _get_cache_users(func: _cached_wrapper_info) -> list[str]:
    """Get cache users"""
    if not func.cache:
        return [NA]

    found: Final[dict[str, bool]] = {}

    for key in func.cache:
        user: str | None = _parse_cached_user(key)
        if user:
            found[user] = True

    return list(found.keys()) if found else [NA]


def _get_cache_values(func: _cached_wrapper_info) -> list[str]:
    """Get cache values"""
    if not func.cache:
        return [NA]

    found: Final[dict[str, str]] = {}

    for val in func.cache.values():
        if not val:
            continue

        for dto in val:
            if dto.name not in found:
                found[dto.name] = f"{dto.name} on {dto.date}"

    return list(found.values()) if found else [NA]


def _create_cache_stats(func: _cached_wrapper_info) -> dict[str, Json]:
    """Create cache stats"""
    info: Final[_CacheInfo] = func.cache_info()
    return {
        func.__name__: {
            "Hits": info.hits,
            "Misses": info.misses,
            "Maximum Size": info.maxsize,
            "Current Size": info.currsize,
            "Cached Users": _get_cache_users(func),
            "Cached Values": _get_cache_values(func),
        }
    }


@ROUTER.get("/cache", response_model=Json)
async def get_cache_stats() -> Json:
    """Get cache stats"""
    try:
        return [_create_cache_stats(get_user), _create_cache_stats(get_substances)]
    except Exception:
        CONSOLE.print_exception()

        return None


@ROUTER.get("/cache/clear", response_model=str)
async def clear_cache_stats() -> str:
    """Clear cache stats"""
    get_user.cache_clear()

    get_substances.cache_clear()

    return "Cache cleared"


@ROUTER.get("/version", response_model=str | None)
@cached(cache=LRUCache(maxsize=1), info=True)
def get_version() -> str | None:
    """Get version"""

    def invalid_version(version: str) -> None:
        """Invalid version"""
        msg: Final[str] = f"Invalid version: {version}"
        raise ValueError(msg)

    try:
        version: Final[str] = env.SOBER_VERSION
        if not Version.is_valid(version):
            invalid_version(version)

        if DEBUG:
            log("Got version:", version)
    except Exception:
        CONSOLE.print_exception()

        return None

    return version


def _verify_jwt(credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]) -> str | None:
    """Verify unsecured JWT"""

    def _invalid_jwt() -> None:
        """Invalid JWT"""
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"}
        )

    user: str | None = None
    try:
        payload = decode(
            jwt=credentials.credentials,
            options={
                "require": ["aud", "exp", "iat", "iss", "sub"],
                "verify_aud": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
                "verify_signature": False,
                "verify_sub": True,
            },
            leeway=5,
            audience=env.SOBER_NAME,
            issuer=env.SOBER_JWT_FRONTEND,
        )
        user = payload.get("sub")
    except InvalidTokenError as e:
        if DEBUG:
            CONSOLE.print(f"[bold][red]❌ JWT Error:[/bold] {e}[/red]")

        _invalid_jwt()
    except Exception:
        if DEBUG:
            CONSOLE.print_exception()

        raise

    return user


def get_user_hash(user: str) -> str:
    """Get user hash"""
    return sha256(user.encode()).hexdigest()


def _validate_user(user: str) -> bool:
    """Validate user"""
    try:
        TypeAdapter(Annotated[str, Field(max_length=MAX_LEN, strict=True)]).validate_python(user)
    except ValidationError:
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid user[/red]")
        return False

    return True


def _bad_request() -> None:
    """Raise 400 error"""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bad Request")


@API.get("/user", response_class=Response, response_model=None, status_code=status.HTTP_204_NO_CONTENT)
@cached(cache=LRUCache(maxsize=2), info=True)
def get_user(user: Annotated[str, Depends(_verify_jwt)]) -> None:
    """Get user"""
    if not _validate_user(user):
        _bad_request()
    else:
        try:
            user_hash: Final[str] = get_user_hash(user)

            created: Final[bool] = User.get_or_create(user=user_hash)[1]

            if DEBUG:
                short_user: Final[str] = _shorten(user_hash)

                if created:
                    log(f"Created user: {short_user}")
                else:
                    log(f"Found user: {short_user}")
        except Exception:
            CONSOLE.print_exception()

            _bad_request()


@API.delete("/user/delete/{user}", response_class=Response, response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user: str) -> None:
    """
    Delete user

    Args:
        user (str): hashed user

    Returns:
        Response: 204 or 400 HTTP status code
    """
    try:
        u: Final[User | None] = User.get_or_none(User.user == user)
        if u is None:
            _bad_request()
        else:
            get_user.cache_clear()

            u.delete_instance()

            if DEBUG:
                log(f"Deleted user: {get_user_hash(user)}")
    except Exception:
        CONSOLE.print_exception()

        _bad_request()


def _to_substance_dto(substance: Substance) -> SubstanceDTO:
    """Convert Substance to SubstanceDTO"""
    return SubstanceDTO(**model_to_dict(substance))


@API.get("/substances", response_model=list[SubstanceDTO] | None)
@cached(cache=LRUCache(maxsize=5), info=True)
def get_substances(user: Annotated[str, Depends(_verify_jwt)]) -> list[SubstanceDTO] | None:
    """Get all substances"""
    if not _validate_user(user):
        return None
    try:
        user_hash: Final[str] = get_user_hash(user)

        u: Final[User | None] = User.get_or_none(User.user == user_hash)
        if u is None:
            return None

        substances: Final[list[Substance]] = u.substances

        count: Final[int] = len(substances)
        if count == 0:
            return None

        if DEBUG:
            log(f"Getting {pluralizer.pluralize('substance', count, True)} for {_shorten(user_hash)}")

        return [_to_substance_dto(substance) for substance in substances]
    except Exception:
        CONSOLE.print_exception()

        return None


def _user_exists(user_hash: str) -> bool:
    """Check if user exists"""
    return User.get_or_none(User.user == user_hash) is not None


def _validate_substance(substance: SubstanceDTO) -> bool:
    """Validate substance"""
    try:
        TypeAdapter(SubstanceDTO).validate_python(substance)
    except ValidationError:
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid SubstanceDTO[/red]")

        return False

    return True


@API.post("/substances/add", response_model=SubstanceDTO | None, status_code=status.HTTP_201_CREATED)
async def add_substance(substance: SubstanceDTO, user: Annotated[str, Depends(_verify_jwt)]) -> SubstanceDTO | None:
    """Add substance"""
    if not _validate_substance(substance) or not _validate_user(user):
        return None

    try:
        user_hash: Final[str] = get_user_hash(user)

        if not _user_exists(user_hash):
            return None

        if DEBUG:
            log(f"Adding substance for {_shorten(user_hash)}:", str(substance))

        get_substances.cache_clear()

        return _to_substance_dto(Substance.create(**substance.model_dump(), user=user_hash))
    except Exception:
        CONSOLE.print_exception()

        return None


def _validate_pk(pk: int) -> bool:
    """Validate PK"""
    try:
        TypeAdapter(Annotated[int, Field(gt=0, strict=True)]).validate_python(pk)
    except ValidationError:
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid PK[/red]")

        return False

    return True


@API.get("/substances/get/{pk}", response_model=SubstanceDTO | None)
async def get_substance(pk: int, user: Annotated[str, Depends(_verify_jwt)]) -> SubstanceDTO | None:
    """Get substance"""
    if not _validate_pk(pk) or not _validate_user(user):
        return None
    try:
        substance: Final[Substance | None] = Substance.get_or_none(Substance.id == pk)
        if substance is None:
            return None

        if DEBUG:
            log("Getting substance ID", str(pk))

        return _to_substance_dto(substance)
    except Exception:
        CONSOLE.print_exception()

        return None


@API.delete("/substances/delete/{pk}", response_model=bool)
async def delete_substance(pk: int, user: Annotated[str, Depends(_verify_jwt)]) -> bool:
    """Delete substance"""
    if not _validate_pk(pk) or not _validate_user(user):
        return False
    try:
        user_hash: Final[str] = get_user_hash(user)

        substance: Final[Substance | None] = Substance.get_or_none(Substance.id == pk, Substance.user == user_hash)
        if substance is not None:
            if DEBUG:
                log(f"Deleting substance {substance.name} for {_shorten(user_hash)}")

            get_substances.cache_clear()

            substance.delete_instance()
        else:
            if DEBUG:
                log("Could not delete ID", str(pk))

            return False
    except Exception:
        CONSOLE.print_exception()

        return False

    return True


@API.put("/substances/update/{pk}", response_model=SubstanceDTO | None)
async def update_substance(
    pk: int, substance: SubstanceDTO, user: Annotated[str, Depends(_verify_jwt)]
) -> SubstanceDTO | None:
    """Update substance"""
    if not _validate_pk(pk) or not _validate_substance(substance) or not _validate_user(user):
        return None
    try:
        user_hash: Final[str] = get_user_hash(user)

        if not _user_exists(user_hash):
            return None

        if DEBUG:
            log(f"Updating substance for {_shorten(user_hash)}:", str(substance))

        get_substances.cache_clear()

        return _to_substance_dto(
            Substance.update(**substance.model_dump(), updated_at=_get_datetime_now())
            .where(Substance.id == substance.id)
            .where(Substance.user == user_hash)
            .returning(Substance)
            .execute()[0]
        )
    except Exception:
        CONSOLE.print_exception()

        return None


ROUTER.include_router(API)


@ROUTER.get(
    "/favicon.ico",
    include_in_schema=False,
    response_class=Response,
    response_model=None,
    status_code=status.HTTP_204_NO_CONTENT,
)
async def get_favicon() -> None:
    """Ignore favicon"""


def _validate_port(port: int) -> bool:
    """Validate port number"""
    try:
        TypeAdapter(Annotated[int, Field(ge=MIN_PORT, le=MAX_PORT, strict=True)]).validate_python(port)
    except ValidationError:
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Port must be 1024-65535[/red]")

        return False

    return True


def _invalid_port(port: int) -> None:
    """Invalid port"""
    msg: Final[str] = f"Invalid port: {port}"
    raise ValueError(msg)


try:
    PORT: Final[int] = env.SOBER_API_PORT
    if not _validate_port(PORT):
        _invalid_port(PORT)
    elif DEBUG:
        log("Got port", str(PORT))
except Exception as e:
    CONSOLE.print_exception()

    raise SystemExit(1) from e

get_version()  # precache

if __name__ == "__main__":
    run("api:ROUTER", host="0.0.0.0", port=PORT, reload=True)  # noqa: S104
