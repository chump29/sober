# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)](./public/sober.webp "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)") Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)

### Sobriety counter <!-- markdownlint-disable-line MD001 -->

---

![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun "Bun") &nbsp;
![Mantine](https://img.shields.io/badge/Mantine-$_mantine-informational?style=plastic&logo=mantine "Mantine") &nbsp;
![React](https://img.shields.io/badge/React-$_react-informational?style=plastic&logo=react "React") &nbsp;
![Vite](https://img.shields.io/badge/Vite-$_vite-informational?style=plastic&logo=vite "Vite")

![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic&logo=v8 "Coverage")

---

### 🏗️ Architecture

#### Docker Compose Flow:

```mermaid
flowchart LR
ui@{shape: rounded, label: "UI"}
uiPort@{shape: rounded, label: "$_uiPort"}
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
