#!.venv/bin/python

# pylint: disable=broad-exception-caught

"""API Service"""

from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from enum import IntEnum, auto
from hashlib import sha256
from os import getenv, getpid, kill, path
from pathlib import Path
from signal import SIGINT, SIGKILL, SIGTERM, Signals, signal
from typing import TYPE_CHECKING, Annotated, ClassVar, Final

from cachetools import LRUCache, _CacheInfo, cached
from dotenv import load_dotenv
from env import set_env_vars  # pyright: ignore[reportMissingImports]
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError, decode
from nh3 import clean  # pylint: disable=no-name-in-module
from peewee import (
    AutoField,
    BooleanField,
    CharField,
    Check,
    DateTimeField,
    DecimalField,
    Default,
    ForeignKeyField,
    IntegerField,
)
from peewee import Model as DatabaseModel
from peewee import (
    SqliteDatabase,
)
from playhouse.shortcuts import model_to_dict
from pluralizer import Pluralizer
from pydantic import BaseModel as ValidationModel
from pydantic import (
    AwareDatetime,
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
from semver import Version
from uvicorn import run

if TYPE_CHECKING:
    from types import FrameType

    from cachetools import _cached_wrapper_info


load_dotenv()
load_dotenv(".env.local")

CONSOLE: Final[Console] = Console()
catch_exceptions()

try:
    DEBUG: bool = TypeAdapter(bool).validate_python(getenv("DEBUG", default="False"))
except ValidationError:
    CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid DEBUG value[/red]")
    DEBUG: bool = False

DB_PATH: Final[str] = "./db/"
DB_FILE: Final[str] = getenv("DB_FILE", "sober.db")
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


class CostType(IntEnum):
    """CostType lookup"""

    DAY = auto()
    WEEK = auto()
    MONTH = auto()
    YEAR = auto()


def get_datetime_now() -> datetime:
    """Get current UTC datetime"""
    return datetime.now(UTC)


class User(BaseModel):
    """User database model"""

    created: DateTimeField = DateTimeField(default=get_datetime_now, constraints=[Default("CURRENT_TIMESTAMP")])
    id: AutoField = AutoField()
    user: CharField = CharField(max_length=MAX_LEN, unique=True)

    @property
    def substances(self: User) -> list[Substance]:
        """Back reference"""
        return list(Substance.select().where(Substance.user == self.user))

    def __str__(self: User) -> str:
        """Show User data as string"""
        return f"user={shorten(str(self.user))}, created={self.created}"

    def __repr__(self: User) -> str:
        """Show User data as string representation"""
        return str(self)


class DecimalFieldToDecimal(DecimalField):
    """Convert to Decimal instead of str"""

    def python_value(self, value: str | Decimal | None) -> Decimal | None:
        """Convert to Decimal with two digits"""
        if value is not None and not isinstance(value, Decimal):
            return Decimal(value).quantize(Decimal("0.01"))
        return value


class Substance(BaseModel):
    """Substance database model"""

    cost: DecimalField = DecimalFieldToDecimal(
        auto_round=True,
        decimal_places=2,
        default=Decimal,
        constraints=[Default(Decimal())],
    )
    cost_type: IntegerField = IntegerField(default=CostType.DAY.value, constraints=[Default(CostType.DAY.value)])
    created_at: DateTimeField = DateTimeField(default=get_datetime_now, constraints=[Default("CURRENT_TIMESTAMP")])
    date: DateTimeField = DateTimeField(default=get_datetime_now, constraints=[Default("CURRENT_TIMESTAMP")])
    id: AutoField = AutoField()
    name: CharField = CharField(max_length=MAX_LEN, unique=True)
    show_coin: BooleanField = BooleanField(default=False, constraints=[Default(False)])
    show_cost: BooleanField = BooleanField(default=False, constraints=[Default(False)])
    show_decimals: BooleanField = BooleanField(default=True, constraints=[Default(True)])
    show_time: BooleanField = BooleanField(default=True, constraints=[Default(True)])
    updated_at: DateTimeField = DateTimeField(default=get_datetime_now, constraints=[Default("CURRENT_TIMESTAMP")])
    user: ForeignKeyField = ForeignKeyField(User, backref="substances", field=User.user, on_delete="CASCADE")

    @dataclass
    class Meta:  # pyright: ignore [reportIncompatibleVariableOverride]
        """Constraints"""

        constraints: ClassVar[list] = [Check("NOT show_cost OR cost > 0")]

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

    model_config = ConfigDict(extra="ignore", validate_by_name=True)


type DecimalToFloat = Annotated[Decimal, PlainSerializer(float, return_type=float)]


class SubstanceDTO(BaseValidation):
    """Substance domain model"""

    cost: DecimalToFloat = Field(decimal_places=2, ge=0.0)
    cost_type: StrictInt = Field(alias="costType", gt=0, le=len(CostType))
    date: AwareDatetime  # UTC
    id: StrictInt | None = Field(gt=0, default=None)
    name: StrictStr = Field(max_length=MAX_LEN)
    show_coin: bool = Field(alias="showCoin")
    show_cost: bool = Field(alias="showCost")
    show_decimals: bool = Field(alias="showDecimals")
    show_time: bool = Field(alias="showTime")

    @field_validator("date")
    @classmethod
    def date_lte(cls, date: datetime) -> datetime:
        """Check date"""
        if date > get_datetime_now():
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
    if not info:
        CONSOLE.log(s)
    else:
        CONSOLE.log(f"{s}: [cyan]{info}[/cyan]")


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


ROUTER: Final[FastAPI] = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redoc_url="/redoc")
ROUTER.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API: Final[APIRouter] = APIRouter(prefix="/api")


type Json = int | float | dict[str, Json] | list[str] | list[Json] | str | None


@ROUTER.get("/cache", response_model=Json)
async def get_cache_stats() -> Json:  # noqa: C901 - 13/10
    """Get cache stats"""
    try:

        def get_cached_users(func: _cached_wrapper_info) -> list[str]:
            """Get cached users"""
            json: list[str] = []
            if func.cache is not None:
                for item in list(func.cache.items()):
                    try:
                        u: str = item[0][1][1]  # before update (cached parameters)
                    except IndexError:
                        u = item[0][0]  # after update (only user parameter)
                    if u not in json:
                        json.append(u)
            return json

        def get_cached_values(func: _cached_wrapper_info) -> list[str]:
            """Get cached values"""
            json: list[str] = []
            if func.cache is not None:
                for item in list(func.cache.values()):
                    if item is not None:
                        v: SubstanceDTO = item[0]
                        if v not in json:
                            json.append(f"{v.name} on {v.date}")
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
                    "Cached Values": get_cached_values(func),
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


set_env_vars()

NA: Final[str] = "N/A"


@ROUTER.get("/version", response_model=str | None)
@cached(cache=LRUCache(maxsize=1), info=True)
def get_version() -> str | None:
    """Get version"""

    def invalid_version(version: str) -> None:
        """Invalid version"""
        msg: Final[str] = f"Invalid version: {version}"
        raise ValueError(msg)

    try:
        version: Final[str] = getenv("_VERSION", NA)
        if not Version.is_valid(version):
            invalid_version(version)
        if DEBUG:
            log("Got version:", version)
    except Exception:
        CONSOLE.print_exception()
        return None
    return version


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
                "require": ["aud", "exp", "iat", "iss", "sub"],
                "verify_aud": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
                "verify_signature": False,
                "verify_sub": True,
            },
            algorithms=["none"],
            leeway=5,
            audience=getenv("_NAME", NA),
            issuer=getenv("ISSUER", NA),
        )
        user = payload.get("sub")
    except InvalidTokenError as e:
        if DEBUG:
            CONSOLE.print(f"[bold][red]❌ JWT Error:[/bold] {e}[/red]")
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
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid user[/red]")
        return False
    return True


def bad_request() -> None:
    """Raise 400 error"""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bad Request")


@API.get("/user", response_class=Response, response_model=None, status_code=status.HTTP_204_NO_CONTENT)
@cached(cache=LRUCache(maxsize=2), info=True)
def get_user(user: Annotated[str, Depends(verify_jwt)]) -> None:
    """Get user"""
    if not validate_user(user):
        bad_request()
    else:
        try:
            user_hash: Final[str] = get_user_hash(user)
            created: Final[bool] = User.get_or_create(user=user_hash)[1]
            if DEBUG:
                short_user: Final[str] = shorten(user_hash)
                if created:
                    log(f"Created user: {short_user}")
                else:
                    log(f"Found user: {short_user}")
        except Exception:
            CONSOLE.print_exception()
            bad_request()


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
            bad_request()
        else:
            get_user.cache_clear()
            u.delete_instance()
            if DEBUG:
                log(f"Deleted user: {get_user_hash(user)}")
    except Exception:
        CONSOLE.print_exception()
        bad_request()


def to_substance_dto(substance: Substance) -> SubstanceDTO:
    """Convert Substance to SubstanceDTO"""
    return SubstanceDTO(**model_to_dict(substance))


@API.get("/substances", response_model=list[SubstanceDTO] | None)
@cached(cache=LRUCache(maxsize=5), info=True)
def get_substances(user: Annotated[str, Depends(verify_jwt)]) -> list[SubstanceDTO] | None:
    """Get all substances"""
    if not validate_user(user):
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
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid SubstanceDTO[/red]")
        return False
    return True


@API.post("/substances/add", response_model=SubstanceDTO | None, status_code=status.HTTP_201_CREATED)
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
        return to_substance_dto(
            Substance.create(cost=s.cost, name=s.name, user=user_hash, cost_type=s.cost_type, date=s.date)
        )
    except Exception:
        CONSOLE.print_exception()
        return None


def validate_pk(pk: int) -> bool:
    """Validate PK"""
    try:
        TypeAdapter(Annotated[int, Field(gt=0, strict=True)]).validate_python(pk)
    except ValidationError:
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Invalid PK[/red]")
        return False
    return True


@API.get("/substances/get/{pk}", response_model=SubstanceDTO | None)
async def get_substance(pk: int, user: Annotated[str, Depends(verify_jwt)]) -> SubstanceDTO | None:
    """Get substance"""
    if not validate_pk(pk) or not validate_user(user):
        return None
    try:
        substance: Final[Substance | None] = Substance.get_or_none(Substance.id == pk)
        if substance is None:
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
        if substance is not None:
            if DEBUG:
                log(f"Deleting substance {substance.name} for {shorten(user_hash)}")
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
            Substance.update(
                cost=s.cost,
                cost_type=s.cost_type,
                date=s.date,
                name=s.name,
                show_coin=s.show_coin,
                show_cost=s.show_cost,
                show_decimals=s.show_decimals,
                show_time=s.show_time,
                updated_at=get_datetime_now(),
            )
            .where(Substance.id == s.id)
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


def validate_port(port: int) -> bool:
    """Validate port number"""
    try:
        TypeAdapter(Annotated[int, Field(ge=1024, le=65_535, strict=True)]).validate_python(port)
    except ValidationError:
        CONSOLE.print("[bold][red]❌ Validation Error:[/bold] Port must be 1024-65535[/red]")
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
    CONSOLE.print("✨ Running local server…")
    if DEBUG:
        CONSOLE.print("🐞 Debug is ON")
    run("api:ROUTER", host="0.0.0.0", port=PORT, reload=True)  # noqa: S104
