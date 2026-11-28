#!.venv/bin/python

# pylint: disable=broad-exception-caught

"""API Service"""

from contextlib import asynccontextmanager
from decimal import Decimal
from enum import CONTINUOUS, UNIQUE, IntEnum, auto, verify
from os import path
from pathlib import Path
from re import compile as re_compile, fullmatch
from threading import RLock
from typing import TYPE_CHECKING, Annotated, Final, NoReturn, cast, final

from anyio import to_thread
from cachetools import LRUCache, cached
from cachetools.keys import hashkey
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Path as FastAPIPath, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from guard import SecurityConfig
from guard.middleware import SecurityMiddleware
from jwt import InvalidTokenError, decode
from nh3 import clean
from peewee import (
    AutoField,
    BooleanField,
    CharField,
    DecimalField,
    ForeignKeyField,
    IntegerField,
    Model as DatabaseModel,
    SqliteDatabase,
)
from playhouse.shortcuts import model_to_dict
from playhouse.sqlite_ext import ISODateTimeField  # ty: ignore[missing-module-member] # pyright: ignore[reportAttributeAccessIssue] # pylint: disable=line-too-long
from pluralizer import Pluralizer
from pydantic import (
    AwareDatetime,
    BaseModel as ValidationModel,
    ConfigDict,
    Field,
    PlainSerializer,
    StrictInt,
    StrictStr,
    TypeAdapter,
    ValidationError,
    field_validator,
)
from rich.console import Console
from rich.traceback import install as catch_exceptions
from secure import ContentSecurityPolicy, Secure
from secure.middleware import SecureASGIMiddleware
from semver import Version
from uvicorn import run
from whenever import OffsetDateTime, ZonedDateTime
from xxhash import xxh3_64_hexdigest as hashed

from env import MAX_PORT, MIN_PORT, env

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator
    from datetime import datetime
    from re import Pattern

    from cachetools import CacheInfo, _cached_wrapper_info

CONSOLE: Final[Console] = Console()
catch_exceptions()

DB_STR: Final[str] = "./" + path.normpath(f"{env.SOBER_DB_PATH}/{env.SOBER_DB_FILE}")

if not DB_STR.startswith(env.SOBER_DB_PATH):
    MSG: Final[str] = "Invalid DB path"
    raise ValueError(MSG)

DB: Final[SqliteDatabase] = SqliteDatabase(
    DB_STR,
    pragmas={
        "busy_timeout": 3000,
        "foreign_keys": True,
        "journal_mode": "WAL",
        "synchronous": "NORMAL",
    },
)


MAX_LEN_HASH: Final[int] = 16
MAX_LEN_NAME: Final[int] = 64

pluralizer: Final[Pluralizer] = Pluralizer()


def _shorten(user: str) -> str:
    """Return shortened SHA-256 string"""
    return user[:7]


class BaseModel(DatabaseModel):
    """Base database model"""

    class Meta:
        """Metadata"""

        database: SqliteDatabase = DB


@verify(CONTINUOUS, UNIQUE)
class CostType(IntEnum):
    """CostType lookup"""

    DAY = auto()
    WEEK = auto()
    MONTH = auto()
    YEAR = auto()


@verify(CONTINUOUS, UNIQUE)
class StatsType(IntEnum):
    """StatsType lookup"""

    NONE = 0
    ALCOHOL = auto()
    SMOKING = auto()


def _get_datetime_now() -> datetime:
    """Get current UTC datetime"""
    return ZonedDateTime.now("UTC").to_stdlib()


def _format_datetime(date_time: datetime) -> str:
    """Format UTC datetime"""
    dt = OffsetDateTime(date_time)

    return dt.format("MM/DD/YY '@' HH:mm:ss")


@final
class User(BaseModel):
    """User database model"""

    created = ISODateTimeField(default=_get_datetime_now)
    id = AutoField()
    user = CharField(max_length=MAX_LEN_HASH, unique=True)

    def __str__(self: User) -> str:
        """Show User data as string"""
        return f"user={_shorten(str(self.user))}, created={_format_datetime(self.created)}"

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
    name = CharField(max_length=MAX_LEN_NAME)
    show_coin = BooleanField(default=False)
    show_cost = BooleanField(default=False)
    show_decimals = BooleanField(default=True)
    show_time = BooleanField(default=True)
    stats_type = IntegerField(default=StatsType.NONE.value)
    updated_at = ISODateTimeField(default=_get_datetime_now)
    user = ForeignKeyField(User, backref="substances", field=User.user, on_delete="CASCADE")

    def __str__(self: Substance) -> str:
        """Show Substance data as string"""
        return (
            f"name={self.name}, "
            f"created_at={_format_datetime(self.created_at)}, updated_at={_format_datetime(self.updated_at)}, "
            f"date={_format_datetime(self.date)}, "
            f"show_coin={self.show_coin}, show_cost={self.show_cost}, show_decimals={self.show_decimals}, "
            f"show_time={self.show_time}, cost={self.cost}, cost_type={CostType(self.cost_type)}, stats_type={StatsType(self.stats_type)}"  # pylint: disable=line-too-long # noqa: E501
        )

    def __repr__(self: Substance) -> str:
        """Show Substance data as string representation"""
        return str(self)


Substance.add_index(Substance.user, Substance.name, unique=True)


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
    name: StrictStr = Field(max_length=MAX_LEN_NAME)
    show_coin: bool = Field(alias="showCoin")
    show_cost: bool = Field(alias="showCost")
    show_decimals: bool = Field(alias="showDecimals")
    show_time: bool = Field(alias="showTime")
    stats_type: StrictInt = Field(alias="statsType", ge=0, le=len(StatsType))

    @field_validator("name", mode="before")  # must be first decorator
    @classmethod
    def sanitize_name(cls: type[SubstanceDTO], name: str) -> str:
        """Sanitize name"""
        return clean(name, tags=set()).replace("&amp;", "&")

    @field_validator("date")  # must be first decorator
    @classmethod
    def date_lte(cls: type[SubstanceDTO], date: datetime) -> datetime:
        """Check date"""
        if date > _get_datetime_now():
            msg: Final[str] = "Date cannot be in the future"
            raise ValueError(msg)

        return date

    def __str__(self: SubstanceDTO) -> str:
        """Show SubstanceDTO data as string"""
        return (
            f"name={self.name}, date={self.date}, "
            f"showCoin={self.show_coin}, showCost={self.show_cost}, showDecimals={self.show_decimals}, "
            f"showTime={self.show_time}, cost={self.cost}, costType={CostType(self.cost_type).name.title()}, statsType={StatsType(self.stats_type).name.title()}"  # pylint: disable=line-too-long # noqa: E501
        )

    def __repr__(self: SubstanceDTO) -> str:
        """Show SubstanceDTO data as string representation"""
        return str(self)


def log(msg: str, info: str = "") -> None:
    """Log to console"""
    s: Final[str] = f"[bold green]{msg}[/bold green]"
    CONSOLE.log(s if not info else f"{s}: [cyan]{info}[/cyan]")


if not Path(env.SOBER_DB_PATH).resolve().exists():
    if env.SOBER_DEBUG:
        CONSOLE.print("📂 Creating path", env.SOBER_DB_PATH)

    Path(env.SOBER_DB_PATH).mkdir(parents=True)

if not Path(DB_STR).resolve().exists():
    if env.SOBER_DEBUG:
        CONSOLE.print("🛢️  Creating database", env.SOBER_DB_FILE)

    User.create_table()

    Substance.create_table()
elif env.SOBER_DEBUG:
    CONSOLE.print("🛢️  Using database", DB_STR)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator:
    """Handle FastAPI lifespan"""

    def _start_db() -> None:
        DB.connect()
        DB.create_tables([User, Substance])

    def _stop_db() -> None:
        DB.execute_sql("PRAGMA wal_checkpoint(TRUNCATE);")
        DB.close()

    CONSOLE.print("✨ Running local server…")

    if env.SOBER_DEBUG:
        CONSOLE.print("🐞 Debug is ON")

    await to_thread.run_sync(_start_db)

    yield

    if env.SOBER_DEBUG:
        CONSOLE.print("🛢️  Closing database")

    await to_thread.run_sync(_stop_db)

    if env.SOBER_DEBUG:
        CONSOLE.print("🛑 Stopping server")


ROUTER: Final[FastAPI] = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redoc_url="/redoc", lifespan=lifespan)
ROUTER.add_middleware(
    SecurityMiddleware,
    config=SecurityConfig(
        enable_redis=False, whitelist=env.SOBER_IPS or None, rate_limit=100, enable_penetration_detection=False
    ),
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


def _verify_jwt(credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]) -> str:
    """Verify unsecured JWT"""

    def _invalid_jwt() -> NoReturn:
        """Invalid JWT"""
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"}
        )

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

        if not isinstance(user, str) or not user.strip():
            _invalid_jwt()
    except InvalidTokenError as e:
        if env.SOBER_DEBUG:
            CONSOLE.print(f"[bold][red]❌ JWT Error:[/bold] {e}[/red]")

        _invalid_jwt()
    except HTTPException:
        raise
    except Exception:
        if env.SOBER_DEBUG:
            CONSOLE.print_exception()

        raise

    return user


def _parse_cached_user(key: tuple) -> str | None:
    """Parse cached users"""
    try:
        return key[1][1]
    except IndexError:
        try:
            return key[0]
        except IndexError:
            return None


HASH: Final[Pattern[str]] = re_compile(r"[\da-f]{16}")


def _is_hash(s: str) -> bool:
    """Determine if hash"""
    return bool(fullmatch(HASH, s))


def _get_cache_users(func: _cached_wrapper_info) -> list[str]:
    """Get cache users"""
    if not func.cache:
        return [NA]

    found: Final[list[str]] = []

    for key in func.cache:
        if user := _parse_cached_user(key):
            found.append(_shorten(user) if _is_hash(user) else user)

    return found or [NA]


def _get_cache_values(func: _cached_wrapper_info) -> list[str]:
    """Get cache values"""
    if not func.cache:
        return [NA]

    found: Final[dict[str, str]] = {}

    for val in func.cache.values():
        if not val:
            continue

        # Substance
        if isinstance(val, list):
            for v in val:
                if v.name not in found:
                    found[v.name] = f"{v.name} on {_format_datetime(v.date)}"

        # User
        elif val.user not in found:
            found[val.user] = (
                f"{_shorten(val.user) if _is_hash(val.user) else val.user} on {_format_datetime(val.created)}"
            )

    return list(found.values()) if found else [NA]


def _create_cache_stats(func: _cached_wrapper_info) -> dict[str, Json]:
    """Create cache stats"""
    info: Final[CacheInfo] = func.cache_info()
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


@ROUTER.get("/cache", response_model=Json, dependencies=[Depends(_verify_jwt)])
async def get_cache_stats() -> Json:
    """Get cache stats"""
    try:
        return [_create_cache_stats(_user_get_or_create), _create_cache_stats(get_substances)]
    except Exception:
        CONSOLE.print_exception()

        return None


@ROUTER.get("/cache/clear", response_model=str, dependencies=[Depends(_verify_jwt)])
async def clear_cache_stats() -> str:
    """Clear cache stats"""
    _user_get_or_create.cache_clear()

    get_substances.cache_clear()

    return "Cache cleared"


@ROUTER.get("/version", response_model=str | None)
@cached(cache=LRUCache(maxsize=1), info=True, lock=RLock())
def get_version() -> str | None:
    """Get version"""

    def invalid_version(version: str) -> NoReturn:
        """Invalid version"""
        msg: Final[str] = f"Invalid version: {version}"
        raise ValueError(msg)

    try:
        if not Version.is_valid(env.SOBER_VERSION):
            invalid_version(env.SOBER_VERSION)

        if env.SOBER_DEBUG:
            log("Got version:", env.SOBER_VERSION)
    except Exception:
        CONSOLE.print_exception()

        return None

    return env.SOBER_VERSION


def _get_user_hash(user: str) -> str:
    """Get user hash"""
    return hashed(user.encode())


def _bad_request() -> NoReturn:
    """Raise 400 error"""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bad Request")


@cached(cache=LRUCache(maxsize=2), key=lambda hashed_user, _=None: hashkey(hashed_user), info=True, lock=RLock())
def _user_get_or_create(hashed_user: str, state: dict | None = None, /) -> User:
    """Get or create user"""
    data: Final = cast("tuple[User, bool]", User.get_or_create(user=hashed_user))
    user, created = data

    if state is not None:
        state["created"] = created  # mutate

    return user


@API.get("/user", response_class=Response, response_model=None)
def get_user(user: Annotated[str, Depends(_verify_jwt)]) -> Response:
    """Get user"""
    state: Final[dict[str, bool]] = {"created": False}

    user_hash: Final[str] = _get_user_hash(user)

    try:
        _user_get_or_create(user_hash, state)

    except Exception:
        CONSOLE.print_exception()

        _bad_request()

    created = state["created"]

    if env.SOBER_DEBUG:
        short_user: Final[str] = _shorten(user_hash)

        if created:
            log(f"Created user: {short_user}")
        else:
            log(f"Found user: {short_user}")

    return Response(status_code=status.HTTP_201_CREATED if created else status.HTTP_204_NO_CONTENT)


def _evict_user_hash(hashed_user: str) -> None:
    """Evict hashed user from cache"""
    key: Final[tuple[str]] = _user_get_or_create.cache_key(hashed_user)

    if _user_get_or_create.cache_lock is not None:
        with _user_get_or_create.cache_lock:
            _user_get_or_create.cache.pop(key, None)

        if env.SOBER_DEBUG:
            log(f"{_shorten(hashed_user)} evicted")


@API.delete("/user/evict", response_class=Response, response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def evict_user(user: Annotated[str, Depends(_verify_jwt)]) -> None:
    """Evict user from cache"""
    _evict_user_hash(_get_user_hash(user))


@API.delete(
    "/user/delete/{target_user}",
    dependencies=[Depends(_verify_jwt)],
    response_class=Response,
    response_model=None,
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(target_user: Annotated[str, FastAPIPath(min_length=1, max_length=MAX_LEN_NAME)]) -> None:
    """Delete user"""
    user_hash: Final[str] = _get_user_hash(target_user)

    if (u := User.get_or_none(User.user == user_hash)) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        u.delete_instance()

        _evict_user_hash(user_hash)

        get_substances.cache_clear()

        if env.SOBER_DEBUG:
            log(f"Deleted user: {_shorten(user_hash)}")
    except Exception:
        CONSOLE.print_exception()

        _bad_request()


def _to_substance_dto(substance: Substance) -> SubstanceDTO:
    """Convert Substance to SubstanceDTO"""
    return SubstanceDTO(**model_to_dict(substance))


@API.get("/substances", response_model=list[SubstanceDTO] | None)
@cached(
    cache=LRUCache(maxsize=5),
    key=lambda user, _=None: hashkey(_get_user_hash(user)),
    info=True,
    lock=RLock(),
)
def get_substances(user: Annotated[str, Depends(_verify_jwt)]) -> list[SubstanceDTO] | None:
    """Get all substances"""
    try:
        user_hash: Final[str] = _get_user_hash(user)

        _user_get_or_create(user_hash)

        substances: Final[list[Substance]] = list(Substance.select().where(Substance.user == user_hash))

        if (count := len(substances)) == 0:
            return None

        if env.SOBER_DEBUG:
            log(f"Getting {pluralizer.pluralize('substance', count, True)} for {_shorten(user_hash)}")

        return [_to_substance_dto(substance) for substance in substances]
    except Exception:
        CONSOLE.print_exception()

        return None


@API.post("/substances/add", response_model=SubstanceDTO, status_code=status.HTTP_201_CREATED)
def add_substance(substance: SubstanceDTO, user: Annotated[str, Depends(_verify_jwt)]) -> SubstanceDTO:
    """Add substance"""
    try:
        user_hash: Final[str] = _get_user_hash(user)

        _user_get_or_create(user_hash, {})

        if env.SOBER_DEBUG:
            log(f"Adding substance for {_shorten(user_hash)}:", str(substance))

        get_substances.cache_clear()

        return _to_substance_dto(Substance.create(**substance.model_dump(exclude={"id"}), user=user_hash))
    except Exception:
        CONSOLE.print_exception()

        _bad_request()


@API.get("/substances/get/{pk}", response_model=SubstanceDTO)
def get_substance(pk: Annotated[int, FastAPIPath(gt=0)], user: Annotated[str, Depends(_verify_jwt)]) -> SubstanceDTO:
    """Get substance"""
    if (substance := Substance.get_or_none(Substance.id == pk, Substance.user == _get_user_hash(user))) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Substance not found")

    if env.SOBER_DEBUG:
        log("Getting substance ID", str(pk))

    return _to_substance_dto(substance)


@API.delete(
    "/substances/delete/{pk}", response_class=Response, response_model=None, status_code=status.HTTP_204_NO_CONTENT
)
def delete_substance(pk: Annotated[int, FastAPIPath(gt=0)], user: Annotated[str, Depends(_verify_jwt)]) -> None:
    """Delete substance"""
    user_hash: Final[str] = _get_user_hash(user)

    if (substance := Substance.get_or_none(Substance.id == pk, Substance.user == user_hash)) is None:
        if env.SOBER_DEBUG:
            log("Could not delete ID", str(pk))

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Substance not found")

    try:
        if env.SOBER_DEBUG:
            log(f"Deleting substance {substance.name} for {_shorten(user_hash)}")

        get_substances.cache_clear()

        substance.delete_instance()
    except Exception:
        CONSOLE.print_exception()

        _bad_request()


@API.put("/substances/update/{pk}", response_model=SubstanceDTO)
def update_substance(
    pk: Annotated[int, FastAPIPath(gt=0)], substance: SubstanceDTO, user: Annotated[str, Depends(_verify_jwt)]
) -> SubstanceDTO:
    """Update substance"""
    user_hash: Final[str] = _get_user_hash(user)

    if env.SOBER_DEBUG:
        log(f"Updating substance for {_shorten(user_hash)}:", str(substance))

    try:
        rows: Final[list[Substance]] = (
            Substance.update(**substance.model_dump(exclude={"id"}), updated_at=_get_datetime_now())
            .where((Substance.id == pk) & (Substance.user == user_hash))
            .returning(Substance)
            .execute()
        )
    except Exception:
        CONSOLE.print_exception()

        _bad_request()

    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Substance not found")

    get_substances.cache_clear()

    return _to_substance_dto(rows[0])


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


def _invalid_port(port: int) -> NoReturn:
    """Invalid port"""
    msg: Final[str] = f"Invalid port: {port}"
    raise ValueError(msg)


try:
    if not _validate_port(env.SOBER_API_PORT):
        _invalid_port(env.SOBER_API_PORT)
    elif env.SOBER_DEBUG:
        log("Got port", str(env.SOBER_API_PORT))
except Exception as e:
    CONSOLE.print_exception()

    raise SystemExit(1) from e

get_version()  # precache

if __name__ == "__main__":
    run("api:ROUTER", host="0.0.0.0", port=env.SOBER_API_PORT, reload=env.SOBER_DEBUG)  # noqa: S104
