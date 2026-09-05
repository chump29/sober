# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)](../frontend/public/sober.webp "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)") Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)

### Sobriety counter <!-- markdownlint-disable-line MD001 -->

---

<!-- cspell:disable -->
![Backend](https://img.shields.io/badge/Backend-1.1.0-chocolate?style=plastic&logo=docker "Backend")

![Behave](https://img.shields.io/badge/Behave->=1.3.3-informational?style=plastic "Behave") &nbsp;
![FastAPI](https://img.shields.io/badge/FastAPI->=0.141.1-informational?style=plastic&logo=fastapi "FastAPI") &nbsp;
![Peewee](https://img.shields.io/badge/Peewee->=4.4.0-informational?style=plastic "Peewee") &nbsp;
![Pydantic](https://img.shields.io/badge/Pydantic->=2.13.5-informational?style=plastic&logo=pydantic "Pydantic") &nbsp;
![SQLite](https://img.shields.io/badge/SQLite-3.53.4-informational?style=plastic&logo=sqlite "SQLite") &nbsp;
![uv](https://img.shields.io/badge/uv-0.12.10-informational?style=plastic&logo=uv "uv")

![Coverage](https://img.shields.io/badge/Coverage-86.70%25-success?style=plastic "Coverage")
<!-- cspell:enable -->

---

### 🏗️ Architecture

#### API Structure:

```mermaid
flowchart LR
port@{shape: brace, label: "&nbsp; FastAPI exposes port 5560"}
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

### API Documentation

|  📄 UI  |  🌐 URL  |
|:-------:|:--------:|
| Swagger | `/docs`  |
|  ReDoc  | `/redoc` |
