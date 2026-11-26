# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)](../frontend/public/sober.webp "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)") Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Backend)

### Sobriety tracker

---

![FastAPI](https://img.shields.io/badge/FastAPI-$_fastapi-informational?style=plastic&logo=fastapi "FastAPI") &nbsp;
![Peewee](https://img.shields.io/badge/Peewee-$_peewee-informational?style=plastic "Peewee") &nbsp;
![Pydantic](https://img.shields.io/badge/Pydantic-$_pydantic-informational?style=plastic&logo=pydantic "Pydantic") &nbsp;
![SQLite](https://img.shields.io/badge/SQLite-$_sqlite-informational?style=plastic&logo=sqlite "SQLite") &nbsp;
![uv](https://img.shields.io/badge/uv-$_uv-informational?style=plastic&logo=uv "uv")

![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic "Coverage")

---

### 🏗️ Architecture

#### API Structure:

```mermaid
flowchart LR
port@{shape: brace, label: "&nbsp; FastAPI exposes port $_backendPort"}
api[["`/api`"]]
get_substances[["`/substances`"]]
add_substance[["`/add`"]]
delete_substance[["`/delete/*{pk}*`"]]
get_substance[["`/get/*{pk}*<sup>1</sup>`"]]
update_substance[["`/update`"]]
get_user[["`/user`"]]
delete_user[["`/delete<sup>1</sup>`"]]
evict_user[["`/evict<sup>1</sup>`"]]
get_cache_stats[["`/cache<sup>1</sup>`"]]
clear_cache_stats[["`/clear<sup>1</sup>`"]]
get_version[["`/version`"]]
api-->get_substances
get_substances-->add_substance
get_substances-->delete_substance
get_substances-->get_substance
get_substances-->update_substance
api-->get_user
get_user-->delete_user
get_user-->evict_user
get_cache_stats-->clear_cache_stats
```

###### <sup>1</sup> Not called by UI

---

### API Documentation

|  📄 UI  |  🌐 URL  |
| :-----: | :------: |
| Swagger | `/docs`  |
|  ReDoc  | `/redoc` |
