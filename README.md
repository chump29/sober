# ![Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ](../frontend/public/sober.webp) Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ

### Sobriety counter <!-- markdownlint-disable-line MD001 -->

---

<!-- cspell:disable -->
![CodeQL](https://github.com/chump29/sober/workflows/CodeQL/badge.svg "CodeQL")

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/chump29/sober?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable-line MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")
<!-- cspell:enable -->

---

### 🐳 Docker

#### Compose Flow:

```mermaid
flowchart LR
frontend@{shape: rounded, label: "sober-frontend:80"}
frontendPort@{shape: rounded, label: "http://localhost:89"}
backend@{shape: rounded, label: "sober-backend:5560"}
backendPort@{shape: rounded, label: "http://localhost:5560"}
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
