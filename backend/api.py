#!.venv/bin/python

# pylint: disable=broad-exception-caught

"""API Service"""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from hashlib import sha256
from os import getenv, getpid, kill
from pathlib import Path
from signal import SIGINT, SIGKILL, SIGTERM, Signals, signal
from tomllib import load
from typing import TYPE_CHECKING, Annotated, Final

from box import Box
from cachetools import LRUCache, _CacheInfo, cached
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError, decode
from nh3 import clean  # pylint: disable=no-name-in-module
from peewee import (
    AutoField,
    BooleanField,
    CharField,
    Check,
    DateField,
    DecimalField,
    ForeignKeyField,
)
from peewee import Model as DatabaseModel
from peewee import (
    SqliteDatabase,
)
from playhouse.shortcuts import model_to_dict
from pluralizer import Pluralizer
from pydantic import BaseModel as ValidationModel
from pydantic import (
    ConfigDict,
    Field,
    PlainSerializer,
    StrictInt,
    StrictStr,
    TypeAdapter,
    ValidationError,
    model_validator,
)
from rich.console import Console
from rich.traceback import install as catch_exceptions
from semver import Version
from str2bool3 import str2bool
from uvicorn import run

if TYPE_CHECKING:
    from types import FrameType

    from cachetools import _cached_wrapper_info

load_dotenv()
load_dotenv(".env.local")

DEBUG: Final[bool] = str2bool(getenv("DEBUG")) or False

DB_PATH: Final[str] = "./db/"
DB_FILE: Final[str] = getenv("DB_FILE", "sober.db")
DB_STR: Final[str] = f"{DB_PATH}{DB_FILE}"
DB: Final[SqliteDatabase] = SqliteDatabase(
    DB_STR, pragmas={"journal_mode": "wal", "wal_checkpoint": "TRUNCATE", "foreign_keys": 1}
)

CONSOLE: Final[Console] = Console()
catch_exceptions()


def shutdown(sig: int, _: FrameType | None = None) -> None:
    """Close database"""
    if DEBUG:
        CONSOLE.print(f"\n❌ {Signals(sig).name } detected")
        CONSOLE.print("🛢️  Closing database")
    DB.close()
    if DEBUG:
        CONSOLE.print("🛑 Stopping server")
    kill(getpid(), SIGKILL)


signal(SIGINT, shutdown)
signal(SIGTERM, shutdown)

MAX_LEN: Final[int] = 64

pluralizer: Final[Pluralizer] = Pluralizer()


def shorten(user: str) -> str:
    """Return shortened SHA-256 string"""
    return user[:7]


class BaseModel(DatabaseModel):
    """Base database model"""

    @dataclass
    class Meta:
        """Metadata"""

        database: Final[SqliteDatabase] = DB


class DecimalFieldToDecimal(DecimalField):
    """Convert to Decimal instead of str"""

    def python_value(self, value: str | Decimal | None) -> Decimal | None:
        """Convert to Decimal with two digits"""
        if value is not None and not isinstance(value, Decimal):
            return Decimal(value).quantize(Decimal("0.01"))
        return value


class User(BaseModel):
    """User database model"""

    cost: DecimalField = DecimalFieldToDecimal(
        auto_round=True,
        constraints=[Check("show_cost != 1 OR cost > 0")],
        decimal_places=2,
        default=None,
        null=True,
    )
    id: AutoField = AutoField()
    show_coin: BooleanField = BooleanField(default=True)
    show_cost: BooleanField = BooleanField(default=False)
    user: CharField = CharField(max_length=MAX_LEN, unique=True)

    @property
    def substances(self) -> list[Substance]:
        """Back reference"""
        return list(Substance.select().where(Substance.user == self.user))

    def __str__(self: User) -> str:
        """Show User data as string"""
        s: str = f"user={shorten(str(self.user))}, show_coin={self.show_coin}, show_cost={self.show_cost}"
        if self.show_cost and self.cost:
            s += f", cost={self.cost}"
        return s

    def __repr__(self: User) -> str:
        """Show User data as string representation"""
        return str(self)


class Substance(BaseModel):
    """Substance database model"""

    date: DateField = DateField()
    id: AutoField = AutoField()
    name: CharField = CharField(max_length=MAX_LEN, unique=True)
    user: ForeignKeyField = ForeignKeyField(User, backref="substances", field=User.user, on_delete="CASCADE")

    def __str__(self: Substance) -> str:
        """Show Substance data as string"""
        return f"name={self.name} on date={self.date}"

    def __repr__(self: Substance) -> str:
        """Show Substance data as string representation"""
        return str(self)


class BaseValidation(ValidationModel):
    """Base domain model"""

    model_config = ConfigDict(
        extra="ignore",  # explicit
        validate_by_name=True,
    )


type DecimalToFloat = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json-unless-none")]


class UserDTO(BaseValidation):
    """User domain model"""

    cost: DecimalToFloat | None = Field(decimal_places=2, default=None)
    show_coin: bool = Field(alias="showCoin")
    show_cost: bool = Field(alias="showCost")
    user: StrictStr | None = Field(max_length=MAX_LEN, default=None)

    @model_validator(mode="after")
    def validate_cost(self) -> UserDTO:
        """Validate cost"""
        if self.show_cost and self.cost and not self.cost > Decimal():
            msg: Final[str] = "cost must be greater than 0 when show_cost is true"
            raise ValueError(msg)
        return self

    def __str__(self: UserDTO) -> str:
        """Show UserDTO data as string"""
        s: str = ""
        if self.user:
            s += f"user={shorten(str(self.user))}, "
        s += f"showCoin={self.show_coin}, showCost={self.show_cost}"
        if self.show_cost:
            s += f", cost={self.cost}"
        return s

    def __repr__(self: UserDTO) -> str:
        """Show UserDTO data as string representation"""
        return str(self)


class SubstanceDTO(BaseValidation):
    """Substance domain model"""

    date: date
    id: StrictInt | None = Field(gt=0, default=None)
    name: StrictStr = Field(max_length=MAX_LEN)

    def __str__(self: SubstanceDTO) -> str:
        """Show SubstanceDTO data as string"""
        return f"name={self.name} on date={self.date}"

    def __repr__(self: SubstanceDTO) -> str:
        """Show SubstanceDTO data as string representation"""
        return str(self)


def log(msg: str, info: str = "") -> None:
    """Log to console"""
    s: Final[str] = f"[bold green]{msg}[/bold green]"
    if not info:
        CONSOLE.log(s)
    else:
        CONSOLE.log(f"{s}: [cyan]{info}[/cyan]")


if not Path(DB_PATH).exists():
    if DEBUG:
        CONSOLE.print("📂 Creating path", DB_PATH)
    Path(DB_PATH).mkdir(parents=True)

if not Path(DB_STR).exists():
    if DEBUG:
        CONSOLE.print("🛢️  Creating database", DB_FILE)
    User.create_table()
    Substance.create_table()
elif DEBUG:
    CONSOLE.print("🛢️  Using database", DB_STR)


ROUTER: Final[FastAPI] = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redoc_url="/redoc")


API: Final[APIRouter] = APIRouter(prefix="/api")


type Json = int | float | None | dict[str, Json] | list[str] | list[Json] | str


@ROUTER.get("/cache", response_model=Json | None)
async def get_cache_stats() -> Json | None:
    """Get cache stats"""
    try:

        def get_cached_users(func: _cached_wrapper_info) -> list[str]:
            """Get cached users"""
            json: list[str] = []
            if func.cache:
                for item in list(func.cache.items()):
                    try:
                        u: str = item[0][1][1]  # before update (cached parameters)
                    except IndexError:
                        u = item[0][0]  # after update (only user parameter)
                    if u not in json:
                        json.append(u)
            return json

        def create_stats(func: _cached_wrapper_info) -> Json:
            """Create stats"""
            info: Final[_CacheInfo] = func.cache_info()
            return {
                func.__name__: {
                    "Hits": info.hits,
                    "Misses": info.misses,
                    "Maximum Size": info.maxsize,
                    "Current Size": info.currsize,
                    "Cached Users": get_cached_users(func),
                }
            }

        return [create_stats(get_user), create_stats(get_substances)]
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
        with Path("pyproject.toml").open("rb") as pyproject:
            version: Final[str] = str(Box(load(pyproject), frozen_box=True).project.version)
            if not Version.is_valid(version):
                invalid_version(version)
            if DEBUG:
                log("Got version:", version)
            return version
    except Exception:
        CONSOLE.print_exception()
        return None


@ROUTER.head("/version")
@cached(cache=LRUCache(maxsize=1))
def get_version_head() -> None:
    """Get HEAD version"""
    return


def verify_jwt(credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]) -> str | None:
    """Verify unsecured JWT"""

    def invalid_jwt() -> None:
        """Invalid JWT"""
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"}
        )

    user: str | None = None
    try:
        payload = decode(
            jwt=credentials.credentials,
            options={
                "require": ["exp", "iat", "sub"],
                "verify_exp": True,
                "verify_iat": True,
                "verify_signature": False,
                "verify_sub": True,
            },
            algorithms=["none"],
            leeway=5,
        )
        user = payload.get("sub")
    except InvalidTokenError:
        if DEBUG:
            CONSOLE.print_exception()
        invalid_jwt()
    except Exception:
        if DEBUG:
            CONSOLE.print_exception()
        raise
    return user


def get_user_hash(user: str) -> str:
    """Get user hash"""
    return sha256(user.encode()).hexdigest()


def validate_user(user: str) -> bool:
    """Validate user"""
    try:
        TypeAdapter(Annotated[str, Field(max_length=MAX_LEN, strict=True)]).validate_python(user)
    except ValidationError:
        CONSOLE.print("[bold red]❌ Validation Error:[/bold] Invalid user")
        return False
    return True


def to_user_dto(user: User) -> UserDTO:
    """Convert User to UserDTO"""
    return UserDTO(**model_to_dict(user))


@API.get("/user", response_model=UserDTO | None)
@cached(cache=LRUCache(maxsize=2), info=True)
def get_user(user: Annotated[str, Depends(verify_jwt)]) -> UserDTO | None:
    """Get user"""
    if not validate_user(user):
        return None
    u: UserDTO | None = None
    try:
        user_hash: Final[str] = get_user_hash(user)
        created: Final[tuple[User, bool]] = User.get_or_create(user=user_hash)
        u = to_user_dto(created[0])
        if not u:
            return None
        if DEBUG:
            short_user: Final[str] = shorten(user_hash)
            if created[1]:
                log(f"User created: {short_user}")
            else:
                log(f"Getting user: {short_user}")
        u.user = None  # sanitize user
    except Exception:
        CONSOLE.print_exception()
        u = None
    return u


def validate_data(data: UserDTO) -> bool:
    """Validate data"""
    try:
        TypeAdapter(UserDTO).validate_python(data)
    except ValidationError:
        CONSOLE.print("[bold red]❌ Validation Error:[/bold] Invalid UserDTO")
        return False
    return True


@API.put("/user/update", response_model=UserDTO | None)
async def update_user(data: UserDTO, user: Annotated[str, Depends(verify_jwt)]) -> UserDTO | None:
    """Update user"""
    if not validate_data(data) or not validate_user(user):
        return None
    try:
        user_hash: Final[str] = get_user_hash(user)
        if DEBUG:
            log(f"Updating user data for {shorten(user_hash)}:", str(data))
        get_user.cache_clear()
        return to_user_dto(
            User.update(cost=data.cost, show_coin=data.show_coin, show_cost=data.show_cost)
            .where(User.user == user_hash)
            .returning(User)
            .execute()[0]
        )
    except Exception:
        CONSOLE.print_exception()
        return None


def to_substance_dto(substance: Substance) -> SubstanceDTO:
    """Convert Substance to SubstanceDTO"""
    return SubstanceDTO(**model_to_dict(substance))


@API.get("/substances", response_model=list[SubstanceDTO] | None)
@cached(cache=LRUCache(maxsize=3), info=True)
def get_substances(user: Annotated[str, Depends(verify_jwt)]) -> list[SubstanceDTO] | None:
    """Get all substances"""
    if not validate_user(user):
        return None
    try:
        user_hash: Final[str] = get_user_hash(user)
        u: Final[User | None] = User.get_or_none(User.user == user_hash)
        if not u:
            return None
        substances: Final[list[Substance]] = u.substances
        count: Final[int] = len(substances)
        if count == 0:
            return None
        if DEBUG:
            log(f"Getting {pluralizer.pluralize('substance', count, True)} for {shorten(user_hash)}")
        return [to_substance_dto(substance) for substance in substances]
    except Exception:
        CONSOLE.print_exception()
        return None


def sanitize(substance: SubstanceDTO) -> SubstanceDTO:
    """Sanitize input"""
    substance.name = clean(substance.name, tags=set()).replace("&amp;", "&")
    return substance


def user_exists(user_hash: str) -> bool:
    """Check if user exists"""
    return User.get_or_none(User.user == user_hash) is not None


def validate_substance(substance: SubstanceDTO) -> bool:
    """Validate substance"""
    try:
        TypeAdapter(SubstanceDTO).validate_python(substance)
    except ValidationError:
        CONSOLE.print("[bold red]❌ Validation Error:[/bold] Invalid SubstanceDTO")
        return False
    return True


@API.post("/substances/add", response_model=SubstanceDTO | None)
async def add_substance(substance: SubstanceDTO, user: Annotated[str, Depends(verify_jwt)]) -> SubstanceDTO | None:
    """Add substance"""
    if not validate_substance(substance) or not validate_user(user):
        return None
    try:
        s: Final[SubstanceDTO] = sanitize(substance)
        user_hash: Final[str] = get_user_hash(user)
        if not user_exists(user_hash):
            return None
        if DEBUG:
            log(f"Adding substance for {shorten(user_hash)}:", str(s))
        get_substances.cache_clear()
        return to_substance_dto(Substance.create(date=s.date, name=s.name, user=user_hash))
    except Exception:
        CONSOLE.print_exception()
        return None


def validate_pk(pk: int) -> bool:
    """Validate PK"""
    try:
        TypeAdapter(Annotated[int, Field(gt=0, strict=True)]).validate_python(pk)
    except ValidationError:
        CONSOLE.print("[bold red]❌ Validation Error:[/bold] Invalid PK")
        return False
    return True


@API.get("/substances/get/{pk}", response_model=SubstanceDTO | None)
async def get_substance(pk: int, user: Annotated[str, Depends(verify_jwt)]) -> SubstanceDTO | None:
    """Get substance"""
    if not validate_pk(pk) or not validate_user(user):
        return None
    try:
        substance: Final[Substance | None] = Substance.get_or_none(Substance.id == pk)
        if not substance:
            return None
        if DEBUG:
            log("Getting substance ID", str(pk))
        return to_substance_dto(substance)
    except Exception:
        CONSOLE.print_exception()
        return None


@API.delete("/substances/delete/{pk}", response_model=bool)
async def delete_substance(pk: int, user: Annotated[str, Depends(verify_jwt)]) -> bool:
    """Delete substance"""
    if not validate_pk(pk) or not validate_user(user):
        return False
    try:
        user_hash: Final[str] = get_user_hash(user)
        substance: Final[Substance | None] = Substance.get_or_none(Substance.id == pk, Substance.user == user_hash)
        if substance:
            if DEBUG:
                log(f"Deleting substance for {shorten(user_hash)}:", str(substance))
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
    pk: int, substance: SubstanceDTO, user: Annotated[str, Depends(verify_jwt)]
) -> SubstanceDTO | None:
    """Update substance"""
    if not validate_pk(pk) or not validate_substance(substance) or not validate_user(user):
        return None
    try:
        s: Final[SubstanceDTO] = sanitize(substance)
        user_hash: Final[str] = get_user_hash(user)
        if not user_exists(user_hash):
            return None
        if DEBUG:
            log(f"Updating substance for {shorten(user_hash)}:", str(s))
        get_substances.cache_clear()
        return to_substance_dto(
            Substance.update(date=s.date)
            .where(Substance.user == user_hash)
            .where(Substance.name == s.name)
            .returning(Substance)
            .execute()[0]
        )
    except Exception:
        CONSOLE.print_exception()
        return None


ROUTER.include_router(API)


@ROUTER.get("/favicon.ico", include_in_schema=False)
async def get_favicon() -> Response:
    """Ignore favicon"""
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def validate_port(port: int) -> bool:
    """Validate port number"""
    try:
        TypeAdapter(Annotated[int, Field(ge=1024, le=65535, strict=True)]).validate_python(port)
    except ValidationError:
        CONSOLE.print("[bold red]❌ Validation Error:[/bold] Port must be 1024-65535")
        return False
    return True


def invalid_port(port: int) -> None:
    """Invalid port"""
    msg: Final[str] = f"Invalid port: {port}"
    raise ValueError(msg)


try:
    PORT: Final[int] = int(getenv("API_PORT", "5560"))
    if not validate_port(PORT):
        invalid_port(PORT)
    elif DEBUG:
        log("Got port", str(PORT))
except Exception as e:
    CONSOLE.print_exception()
    raise SystemExit(1) from e

get_version()  # precache

if __name__ == "__main__":
    CONSOLE.print("✨ Running local server...")
    if DEBUG:
        CONSOLE.print("🐞 Debug is ON")
    run("api:ROUTER", host="0.0.0.0", port=PORT, reload=True)  # noqa: S104
