# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)](./public/sober.webp "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)") Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ (Frontend)

### Sobriety tracker

---

![Bun](https://img.shields.io/badge/Bun-1.4.5-informational?style=plastic&logo=bun "Bun") &nbsp;
![Mantine](https://img.shields.io/badge/Mantine-9.8.2-informational?style=plastic&logo=mantine "Mantine") &nbsp;
![React](https://img.shields.io/badge/React-19.3.1-informational?style=plastic&logo=react "React") &nbsp;
![Vite](https://img.shields.io/badge/Vite-8.4.0-informational?style=plastic&logo=vite "Vite")

![Coverage](https://img.shields.io/badge/Coverage-97.35%25-success?style=plastic&logo=v8 "Coverage")

---

### 🏗️ Architecture

#### Docker Compose Flow:

```mermaid
flowchart LR
ui@{shape: rounded, label: "UI"}
port@{shape: rounded, label: "89"}
ui-->port
```

---

#### React Component Hierarchy:

```mermaid
flowchart TD
index(index.html)
main(src/main.tsx)
app(src/App.tsx)
home(src/pages/Home.tsx)
milestones(src/pages/Milestones.tsx)
settings(src/pages/Settings.tsx)
stats(src/pages/Stats.tsx)
banner(src/components/Banner.tsx)
coin(src/components/Coin.tsx)
logo(src/components/Logo.tsx)
substances(src/components/Substances.tsx)
app-->home-->coin
home-->substances
app-->logo
index-->main-->app-->banner
app-->milestones-->substances
app-->settings-->substances
app-->stats-->substances
app-->substances
port@{shape: comment, label: "&nbsp; Nginx exposes port 80"}
```
