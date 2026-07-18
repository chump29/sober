# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)](./public/sober.webp "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)") Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)

### Sobriety counter <!-- markdownlint-disable-line MD001 -->

---

<!-- cspell:disable -->
![Bun](https://img.shields.io/badge/Bun-~1.3.14-informational?style=plastic&logo=bun "Bun") &nbsp;
![Mantine](https://img.shields.io/badge/Mantine-^9.4.1-informational?style=plastic&logo=mantine "Mantine") &nbsp;
![React](https://img.shields.io/badge/React-^19.2.7-informational?style=plastic&logo=react "React") &nbsp;
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-informational?style=plastic&logo=typescript "TypeScript") &nbsp; <!-- markdownlint-disable-line MD013 -->
![Valibot](https://img.shields.io/badge/Valibot-^1.4.2-informational?style=plastic&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAuNDE0IiB5MT0iMC4yNTUiIHgyPSIwIiB5Mj0iMC45MzIiIGdyYWRpZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlYWIzMDgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjYThhMDQiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjAuMzM4IiB5MT0iMC4wMiIgeDI9IjAuNjY0IiB5Mj0iMC45NjYiIGdyYWRpZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZGU2OGEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYmJmMjQiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYyIgeTE9IjAuNSIgeDI9IjEiIHkyPSIwLjUiIGdyYWRpZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM3ZGQzZmMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwZWE1ZTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjA1NiAtMTg5OSkiPjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDU2IDE4OTkpIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTc0Mi4yNzEsOTg3LjAyNGMtNjYuNzA2LDAtMTE5LjEyMSw1NC42NzMtMTIxLjg3NCwxMjYuNDA4bC0yLjU1MSw5NS40NzFjLTMuOTY3LDc4LjY1Myw3MS45NjEsMTA1LjUyLDEyNi45MzYsMTA1LjUyWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQ2My40NTggMTAwNC4yNzcpIiBmaWxsPSJ1cmwoI2EpIi8+PHBhdGggZD0iTTkyLjYxNi4wMUgzMTkuODk0YzU0LjUzLS44LDk1LjYyNCw0MC4xLDk4LjM4MSw5My4zMzVsNi4xNDQsMTM1Ljc2Yy43MzIsNjcuMzY4LTQ4LjExNiw5NC45NS0xMDQuNTI1LDk1LjMzNUw5Mi42MTYsMzI3LjM3NEMzNC4wNjEsMzI3LjgtMS4wNjMsMjgzLjY2My4wMjIsMjI5LjEwNWwzLjgtMTM1Ljc2QzcuNDEsMzMuNTQsMzMuMywxLjA5Myw5Mi42MTYuMDFaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTE4LjQyIDE5OTEuMzAyKSIgZmlsbD0idXJsKCNiKSIvPjxwYXRoIGQ9Ik04Ni44NDQuMDA5SDI5OS45NThjNTEuMTMyLS43NDYsODkuNjY1LDM3LjMwNyw5Mi4yNSw4Ni44MjRsNS43NjEsMTI2LjI5Yy42ODYsNjIuNjY5LTQ1LjExNyw4OC4zMjYtOTguMDExLDg4LjY4NUw4Ni44NDQsMzA0LjUzN0MzMS45MzgsMzA0LjkzMy0xLDI2My44NzUuMDIsMjEzLjEyM0wzLjU4LDg2LjgzNEM2Ljk0OCwzMS4yLDMxLjIyMiwxLjAxNiw4Ni44NDQuMDA5WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjEzNi45NzcgMjAwMS43MzcpIiBmaWxsPSIjMTExODI3Ii8+PHBhdGggZD0iTTI3LjYyNiwwQTI3LjYyNiwyNy42MjYsMCwxLDEsMCwyNy42MjYsMjcuNjI2LDI3LjYyNiwwLDAsMSwyNy42MjYsMFoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0MjEuMTQ4IDIxMDQuMzU3KSIgZmlsbD0idXJsKCNjKSIvPjxwYXRoIGQ9Ik0yNy42MjYsMEEyNy42MjYsMjcuNjI2LDAsMSwxLDAsMjcuNjI2LDI3LjYyNiwyNy42MjYsMCwwLDEsMjcuNjI2LDBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjA4LjAzNCAyMTA0LjM1NykiIGZpbGw9InVybCgjYykiLz48L2c+PC9zdmc+ "Valibot") &nbsp; <!-- markdownlint-disable-line MD013 -->
![Vite](https://img.shields.io/badge/Vite-^8.1.5-informational?style=plastic&logo=vite "Vite")

![Coverage](https://img.shields.io/badge/Coverage-71.38%25-success?style=plastic&logo=v8 "Coverage")

![CodeQL](https://github.com/chump29/sober/workflows/CodeQL/badge.svg "CodeQL") &nbsp;
![License](https://img.shields.io/github/license/chump29/sober?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3")
<!-- cspell:enable -->

---

### 🏗️ Architecture

#### Docker Compose Flow:

```mermaid
flowchart LR
ui@{shape: rounded, label: "UI"}
uiPort@{shape: rounded, label: ""}
ui-->uiPort
```

---

#### React Component Hierarchy:

```mermaid
flowchart TD
index(index.html)
main(src/main.tsx)
display(src/components/display/index.tsx)
settings(src/components/settings/index.tsx)
coin(src/components/coin/index.tsx)
cost(src/components/cost/index.tsx)
index-->main-->display
display-->settings
display-->coin
display-->cost
port@{shape: comment, label: "&nbsp; Nginx exposes port 80"}
```

---

### 🛠️ Environment Management

#### Node.js ([Bun](https://github.com/oven-sh/bun "Bun") manager):

| 📋 Task |  🔧 Command   |
|:-------:|:-------------:|
| Upgrade | `bun upgrade` |

### 📦 Dependency Management

#### Installation & Removal:

|        📋 Task         |            🔧 Command (Full)             |           🔧 Command (Short)           |
|:----------------------:|:----------------------------------------:|:--------------------------------------:|
|      Install DEV       |              `bun install`               |                `bun i`                 |
|      Install PROD      |        `bun install --production`        |               `bun i -p`               |
|     Add dependency     |      `bun add [package][@version]`       |      `bun a [package][@version]`       |
|   Add devDependency    | `bun add --save-dev [package][@version]` |     `bun a -d [package][@version]`     |
| Add optionalDependency | `bun add --optional [package][@version]` | `bun a --optional [package][@version]` |
|   Add peerDependency   |   `bun add --peer [package][@version]`   |   `bun a --peer [package][version]`    |
|       Add Global       |  `bun add --global [package][@version]`  |     `bun a -g [package][@version]`     |
|   Remove Dependency    |          `bun remove [package]`          |           `bun r [package]`            |

#### Maintenance & Quality:

|     📋 Task     |   🔧 Command (Full)    | 🔧 Command (Short)  |
|:---------------:|:----------------------:|:-------------------:|
|  Check Updates  |     `bun outdated`     |       &mdash;       |
|   Update All    |      `bun update`      |       &mdash;       |
| Update Specific | `bun update [package]` |       &mdash;       |
| Security Audit  |      `bun audit`       |       &mdash;       |
|  Package Info   |  `bun info [package]`  |       &mdash;       |
|   Run Script    |   `bun run [script]`   |   `bun [script]`    |
|      List       |       `bun list`       |       &mdash;       |
|   List Extra    |    `bun list --all`    |       &mdash;       |
|    Hierarchy    | `bun pm why [package]` | `bun why [package]` |

### 🧪 Development

#### Scripts:

|     📋 Task     |    🔧 Command (Full)    | 🔧 Command (Short) |
|:---------------:|:-----------------------:|:------------------:|
| Lint All (DEV)  |     `bun run lint`      |     `bun lint`     |
|  Lint All (CI)  |    `bun run lint:ci`    |   `bun lint:ci`    |
|   Lint Biome    |  `bun run lint:biome`   |  `bun lint:biome`  |
|    Lint CSS     |   `bun run lint:css`    |   `bun lint:css`   |
|    Lint ENV     |   `bun run lint:env`    |   `bun lint:env`   |
|    Lint HTML    |   `bun run lint:html`   |  `bun lint:html`   |
|  Lint Spelling  |  `bun run lint:spell`   |  `bun lint:spell`  |
|     Run DEV     |      `bun run dev`      |     `bun dev`      |
| Build/Run PROD  |     `bun run prod`      |     `bun prod`     |
|   Build PROD    |     `bun run build`     |      &mdash;       |
|      Test       |     `bun run test`      |      &mdash;       |
| Test w/Coverage | `bun run test:coverage` |      &mdash;       |

#### Docker Deployment:

| 📜 Script  |   🔧 Command   |
|:----------:|:--------------:|
|    Full    |  `./build.sh`  |
| Image Only | `./Dockerfile` |

---

### 📄 Documentation

#### Building:

```bash
./docs.sh
```

---

### 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted and tested
- **Github Actions:** Lints, tests, builds, and pushes multi-architecture images to repository
  - latest
    - amd64
    - arm64
