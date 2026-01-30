# <img src="./public/sober.png" title="Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" alt="Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ logo" width="64" height="64"> Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ

> Enter the day your recovery began to see your total sober time

---

## 🏗️ Architecture

### Docker Compose Flow

```mermaid
flowchart LR
ui@{shape: rounded, label: "UI"}
uiPort@{shape: rounded, label: "http://localhost:89"}
ui-->uiPort
```

---

### React Component Hierarchy

```mermaid
flowchart TD
index(index.html)-->main(src/main.tsx)
main-->dashboard(src/components/dashboard/index.tsx)
dashboard-->coin(src/components/coin/index.tsx)
port@{shape: comment, label: "&nbsp; Nginx exposes port 80"}
```

---

## 🔗 Deep Linking

You can pre-load a specific date using a query parameter:

`?soberDate=YYYY-MM-DD`

---

## 🛠️ Environment Management

### Node.js (`n` manager)

|     📋 Task      |     🔧 Command     |
| :--------------: | :----------------: |
| Manage Versions  |      `sudo n`      |
| Install Specific | `sudo n [version]` |

### NPM (`pnpm` manager)

|   📋 Task    |          🔧 Command           |
| :----------: | :---------------------------: |
|    Enable    |    `corepack enable pnpm`     |
|     Use      |  `corepack use pnpm@latest`   |
| Use Specific | `corepack use pnpm@[version]` |
|    Update    |         `corepack up`         |

## 📦 Dependency Management

### Installation & Removal

|        📋 Task         |               🔧 Command (Full)                |        🔧 Command (Short)         |
| :--------------------: | :--------------------------------------------: | :-------------------------------: |
|      Install All       |                 `pnpm install`                 |             `pnpm i`              |
|   Install Prod Only    |             `pnpm install --prod`              |            `pnpm i -P`            |
|     Add dependency     |   `pnpm add --save-prod [package][@version]`   |  `pnpm add [package][@version]`   |
|   Add devDependency    |   `pnpm add --save-dev [package][@version]`    | `pnpm add -D [package][@version]` |
| Add optionalDependency | `pnpm add --save-optional [package][@version]` | `pnpm add -O [package][@version]` |
|   Add peerDependency   |   `pnpm add --save-peer [package][@version]`   |              &mdash;              |
|       Add Global       |    `pnpm add --global [package][@version]`     | `pnpm add -g [package][@version]` |
|   Remove Dependency    |            `pnpm remove [package]`             |        `pnpm rm [package]`        |

### Maintenance & Quality

|    📋 Task     |  🔧 Command (Full)  | 🔧 Command (Short) |
| :------------: | :-----------------: | :----------------: |
| Check Updates  |   `pnpm outdated`   |      &mdash;       |
|   Update All   |    `pnpm update`    |     `pnpm up`      |
| Security Audit |    `pnpm audit`     |      &mdash;       |
|   Run Script   | `pnpm run [script]` |  `pnpm [script]`   |

## 🧪 Development Workflow

|       📜 Script        |       🔧 Command       |
| :--------------------: | :--------------------: |
|        Lint All        |    `pnpm run lint`     |
|        Lint CSS        |  `pnpm run lint:css`   |
|       Run ESLint       | `pnpm run lint:eslint` |
|       Lint HTML        |  `pnpm run lint:html`  |
|     Lint Markdown      |   `pnpm run lint:md`   |
|      Run Prettier      | `pnpm run lint:pretty` |
| Run Tests (Hot Reload) |  `pnpm run test:dev`   |
|     Run Tests (CI)     |    `pnpm run test`     |
|       Build Dev        |  `pnpm run build:dev`  |
|       Build Prod       |    `pnpm run build`    |

### Manual Deployment

```bash
# Build via script
./build.sh

# Build via Docker
./Dockerfile
```

## 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted and tested
- **Github Actions:** Automatically builds and pushes multi-arch images to repository
  - amd64
  - arm64
