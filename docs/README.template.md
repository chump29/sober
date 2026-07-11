# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ](../frontend/public/sober.webp) Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ

### Sobriety counter <!-- markdownlint-disable-line MD001 -->

---

<!-- cspell:disable -->
![CodeQL](https://github.com/$_user/$_repo/workflows/CodeQL/badge.svg "CodeQL")

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/$_user/$_repo?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable-line MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")
<!-- cspell:enable -->

---

### 🐳 Docker

#### Compose Flow:

```mermaid
flowchart LR
frontend@{shape: rounded, label: "sober-frontend:80"}
frontendPort@{shape: rounded, label: "http://localhost:$_frontendPort"}
backend@{shape: rounded, label: "sober-backend:$_backendPort"}
backendPort@{shape: rounded, label: "http://localhost:$_backendPort"}
frontend-->frontendPort
backend-->backendPort
```

#### Building Images:

```bash
./build.sh
```

---

### 📄 Documentation

#### Building:

```bash
./docs.sh
```

#### Links:

- [Frontend](./frontend/README.md "Frontend")
- [Backend](./backend/README.md "Backend")
