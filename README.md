# 🧠 AI Support System

The **AI Support System** is a modular backend platform that integrates multiple AI and data components — including **MongoDB**, **Elasticsearch**, **Weaviate**, and **Redis** — to provide intelligent search, knowledge management, and chat capabilities.

---

## 🚀 Overview

This project is built as a **multi-service architecture** using Docker Compose.  
It includes the following key services:

- **Search Service** – Manages Elasticsearch-based document indexing and querying.  
- **Vector Store (Weaviate)** – Stores embeddings for semantic search using OpenAI vectors.  
- **MongoDB** – Primary data store for structured content.  
- **Redis** – Caching and session management.  
- **Elasticsearch** – Full-text search engine for keyword-based search.

---

## 🧩 Tech Stack

| Component | Technology |
|------------|-------------|
| Language | Node.js (TypeScript / JavaScript) |
| Database | MongoDB |
| Search Engine | Elasticsearch 7.x |
| Vector Database | Weaviate |
| Cache / Queue | Redis |
| Containerization | Docker & Docker Compose |
| Embeddings | OpenAI `text2vec-openai` module |

---

## ⚙️ Prerequisites

Before starting, make sure you have:

- **Docker** and **Docker Compose** installed  
- A valid **OpenAI API key**  
- Node.js v18+ (for development outside Docker, optional)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-support-system.git
cd ai-support-system
```

### 2. Create an `.env` File
Create a `.env` file in the root directory and add:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start All Services
```bash
docker compose up -d
```

This command starts:
- MongoDB on port **27017**
- Elasticsearch on port **9200**
- Weaviate on port **8080**
- Redis on port **6379**

### 4. Run the Node.js Service (if separate)
Inside the service directory:
```bash
cd services/search-service
npm install
npm run dev
```

The service should now be available at:
```
http://localhost:5002
```

---

## 🧠 Architecture

```
┌──────────────────────────────────────────────┐
│                  Client / API                │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│              Search Service (Node.js)        │
│ - Manages indexing & querying                │
│ - Connects to Elasticsearch & Weaviate       │
└──────────────────────────────────────────────┘
        │                │              │
        ▼                ▼              ▼
  MongoDB           Elasticsearch     Weaviate
   (Data)             (Search)       (Vectors)
        │
        ▼
      Redis
 (Cache / Queue)
```

---

## 🧩 Useful Commands

| Command | Description |
|----------|-------------|
| `docker compose up -d` | Start all services in detached mode |
| `docker compose logs -f` | Stream all service logs |
| `docker compose down` | Stop and remove all containers |
| `docker ps` | Check running containers |

---

## 🧰 Troubleshooting

- **Elasticsearch errors**  
  - If running on **ARM (M1/M2)**, use a compatible image like `arm64v8/elasticsearch:7.17.10`
  - Add `platform: linux/arm64` under the Elasticsearch service in `docker-compose.yml`

- **Connection errors**  
  Ensure your app connects to services via:
  ```
  mongodb://mongo:27017
  http://elasticsearch:9200
  redis://redis:6379
  http://weaviate:8080
  ```

- **Weaviate not connecting**  
  Check if your `OPENAI_API_KEY` is set correctly.

---

## 📚 Folder Structure

```
ai-support-system/
│
├── services/
│   ├── search-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── ...
│
├── docker-compose.yml
├── .env
└── README.md
```

---


