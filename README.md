# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ logo](/frontend/public/sober.png) Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ

Choose a sober date and the date/time difference will be displayed

# Compose flowchart

```mermaid
flowchart LR
frontend@{shape: rounded, label: "frontend"}
frontendPort@{shape: rounded, label: "http://localhost:89"}
backend@{shape: rounded, label: "backend (direct)"}
backendPort@{shape: rounded, label: "http://localhost:5556"}
frontend-->frontendPort
backend-->backendPort
```

---

# Development stuff

### Backend:

```bash
cd backend
uv lock
uv sync --extra dev
python api.py &
```

### Frontend:

```bash
cd frontend
pnpm i
pnpm run build:dev
```

# Docker stuff

### To build images:

```bash
# All
./build.sh

# Backend
cd backend && ./build.sh

# Frontend
cd frontend && ./build.sh
```