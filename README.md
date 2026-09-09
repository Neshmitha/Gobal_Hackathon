# Clarion – AI Research Pilot

![License](https://img.shields.io/badge/License-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-v19-blue.svg)
![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)
![Render](https://img.shields.io/badge/Deploy-Render-informational.svg)

Clarion is an AI-powered research workspace designed to help students, researchers, and innovators discover, organize, draft, and collaborate on research papers efficiently. It streamlines the complete research workflow—from initial topic exploration to AI-assisted paper drafting and peer collaboration—using state-of-the-art LLMs (Gemini, LLaMA, Groq) and RAG (Retrieval-Augmented Generation) technology.

---

## 🚀 Key Features

### 🔍 Paper Discovery & ArXiv Integration
- Search research papers directly from ArXiv by topic or domain.
- Preview paper abstracts, authors, and citation details before saving them directly to your workspace.

### 📚 Research Workspace & My Library
- Personal research hub to manage saved and uploaded PDF research papers.
- Track research domains, add customized notes, mark favorites, and calculate paper impact factors.
- Compare two research papers side-by-side using AI for deep analytical insights.

### 🤖 AI Research Assistant & RAG Pipeline
- Context-aware chatbot powered by LLaMA and Gemini API.
- Answers research-related questions, explains complex methodologies, and retrieves relevant citations from your index.

### ✍️ Paper Drafter & DocSpace Editor
- Auto-generate structured paper drafts based on topic, domain, and specific section preferences (IEEE, Springer, APA, ACM, Elsevier formats).
- Integrated rich text editor (DocSpace) similar to Google Docs for real-time document editing and formatting.

### 🧭 Guided Research Builder
- Step-by-step workflow for research beginners: domain selection, paper discovery, problem statement formulation, methodology planning, experiment design, gap analysis, and final evaluation score.

### 🤝 Collaborative Contributions
- Peer-to-peer research collaboration system.
- Issue owners can post specific research queries or task requests.
- Contributors submit pitches and solutions, which owners can review, rate, and incorporate.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios
- **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose
- **AI Services**: Google Gemini API, Groq LLaMA models, LLaMA Cloud, FAISS Indexing (RAG)
- **Deployment**: Render (Web Service & Static Site via `render.yaml` Blueprint)

---

## 📁 Repository Structure

```
project-hackathon/
├── client/                 # React (Vite) Frontend Application
│   ├── src/                # Components, Pages, Assets, and Configuration
│   ├── index.html          # Entry HTML file
│   ├── package.json        # Frontend Dependencies
│   └── vite.config.js      # Vite Configuration
├── server/                 # Express.js Backend API
│   ├── controllers/        # Route Handlers & Business Logic
│   ├── models/             # Mongoose Data Schemas
│   ├── routes/             # API Endpoints
│   ├── services/           # AI, RAG & FAISS Services
│   ├── index.js            # Server Entrypoint
│   ├── package.json        # Backend Dependencies
│   └── .env.example        # Environment Variables Template
├── render.yaml             # Render Infrastructure-as-Code Blueprint
└── README.md               # Project Documentation
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Neshmitha/Gobal_Hackathon.git
cd Gobal_Hackathon
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` directory based on `server/.env.example`:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.p975hui.mongodb.net/ResearchPilot
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
LLAMA_CLOUD_API_KEY=your_llama_cloud_key
CLIENT_URL=http://localhost:5173
```

*(Optional)* Create a `.env` file in the `client/` directory for local API mapping:
```env
VITE_API_BASE_URL=http://127.0.0.1:5001/api
```

### 3. Run Backend

```bash
cd server
npm install
npm run dev
```
*(Runs backend server on `http://localhost:5001`)*

### 4. Run Frontend

```bash
cd ../client
npm install
npm run dev
```
*(Runs frontend application on `http://localhost:5173`)*

---

## ☁️ Deployment on Render

This repository includes a [`render.yaml`](render.yaml) blueprint configuration for one-click monorepo deployment on Render.

### Blueprint Deployment (Recommended):

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Blueprints**.
2. Connect your GitHub repository: `https://github.com/Neshmitha/Gobal_Hackathon`.
3. Provide the required Environment Variables (`MONGO_URI`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`).
4. Set `VITE_API_BASE_URL` to your backend URL (e.g. `https://clarion-backend.onrender.com/api`).
5. Render will automatically build and launch both the backend web service and the static React frontend!

> **Note for MongoDB Atlas**: In your MongoDB Atlas Dashboard, go to **Network Access** and add `0.0.0.0/0` to allow inbound connections from Render.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
