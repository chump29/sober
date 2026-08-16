# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)](../frontend/public/sober.webp "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)") Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)

### Sobriety counter <!-- markdownlint-disable-line MD001 -->

---

<!-- cspell:disable -->
![Backend](https://img.shields.io/badge/Backend-$_version-chocolate?style=plastic&logo=docker "Backend")

![Behave](https://img.shields.io/badge/Behave-$_behave-informational?style=plastic "Behave") &nbsp;
![FastAPI](https://img.shields.io/badge/FastAPI-$_fastapi-informational?style=plastic&logo=fastapi "FastAPI") &nbsp;
![Peewee](https://img.shields.io/badge/Peewee-$_peewee-informational?style=plastic "Peewee") &nbsp;
![Pydantic](https://img.shields.io/badge/Pydantic-$_pydantic-informational?style=plastic&logo=pydantic "Pydantic") &nbsp;
![SQLite](https://img.shields.io/badge/SQLite-$_sqlite-informational?style=plastic&logo=sqlite "SQLite") &nbsp;
![uv](https://img.shields.io/badge/uv-$_uv-informational?style=plastic&logo=uv "uv")

![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic "Coverage")
<!-- cspell:enable -->

---

### 🏗️ Architecture

#### API Structure:

```mermaid
flowchart LR
port@{shape: brace, label: "&nbsp; FastAPI exposes port $_backendPort"}
api[["`/api`"]]
get_substances[["`/substances`"]]
add_substance[["`/add`"]]
delete_substance[["`/delete/*[pk]*`"]]
get_substance[["`/get/*[pk]*`"]]
update_substance[["`/update`"]]
get_user[["`/user`"]]
delete_user[["`/delete/[user]`"]]
get_cache_stats[["`/cache`"]]
clear_cache_stats[["`/clear`"]]
get_version[["`/version`"]]
api-->get_substances
get_substances-->add_substance
get_substances-->delete_substance
get_substances-->get_substance
get_substances-->update_substance
api-->get_user
get_user-->delete_user
get_cache_stats-->clear_cache_stats
```

---

### 🛠️ Environment Management

#### Python ([uv](https://github.com/astral-sh/uv "uv") manager):

|        📋 Task         |           🔧 Command            |
|:----------------------:|:-------------------------------:|
|         Update         |        `uv self update`         |
|        Install         |  `uv python install [version]`  |
|       Uninstall        | `uv python uninstall [version]` |
|          Pin           |    `uv python pin [version]`    |
| Create/Update Lockfile |            `uv lock`            |
|   Create/Update venv   |            `uv sync`            |
| Create/Update env venv |     `uv sync --extra [env]`     |
|   Installed Versions   |        `uv python list`         |

### 📦 Dependency Management

#### Installation & Removal:

|        📋 Task        |               🔧 Command               |
|:---------------------:|:--------------------------------------:|
|    Add Dependency     |           `uv add [package]`           |
|  Add env Dependency   |  `uv add --optional [env] [package]`   |
|   Remove Dependency   |         `uv remove [package]`          |
| Remove env Dependency | `uv remove --optional [env] [package]` |

#### Maintenance & Quality:

|     📋 Task      |               🔧 Command               |
|:----------------:|:--------------------------------------:|
|  Check Updates   |        `uv pip list --outdated`        |
|   Upgrade All    |          `uv lock --upgrade`           |
|       List       |             `uv pip list`              |
|    List Tree     |               `uv tree`                |
|    Hierarchy     |     `uv tree --package [package]`      |
| Hierarchy Parent | `uv tree --package [package] --invert` |
|   Clean Cache    |            `uv cache clean`            |
|  Security Audit  |               `uv audit`               |

### 🧪 Development

#### Scripts:

 | 📋 Task / 📜 Script |      🔧 Command (Full)      | 🔧 Command (Short) |
 |:-------------------:|:---------------------------:|:------------------:|
 |        Lint         | `uv run pylint --verbose .` |    `./lint.sh`     |
 |        Test         |   `uv run behave --stop`    |    `./test.sh`     |

#### API Deployment:

| 📋 Task / 📜 Script |             🔧 Command (Full)             | 🔧 Command (Short) |
|:-------------------:|:-----------------------------------------:|:------------------:|
|         DEV         | `uv run fastapi dev api.py --port $_port` |     `./api.py`     |
|        PROD         | `uv run fastapi run api.py --port $_port` |      &mdash;       |

#### API Documentation:

|  📄 UI  |  🌐 URL  |
|:-------:|:--------:|
| Swagger | `/docs`  |
|  ReDoc  | `/redoc` |

#### Docker Deployment:

| 📜 Script  |   🔧 Command   |
|:----------:|:--------------:|
|    Full    |  `./build.sh`  |
| Image Only | `./Dockerfile` |

#### Virtual Environment:

|     📋 Task     |         🔧 Command          |
|:---------------:|:---------------------------:|
|     Create      |          `uv venv`          |
| Create Specific |   `uv venv -p [version]`    |
|    Activate     | `source .venv/bin/activate` |
|   Deactivate    |        `deactivate`         |
