# Clarion – AI Research Pilot & Career Intelligence Platform

![License](https://img.shields.io/badge/License-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-v19-blue.svg)
![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)
![Render](https://img.shields.io/badge/Deploy-Render-informational.svg)

**Clarion** is a unified, AI-powered research ecosystem built to bridge the gap between academic research execution and career development. The platform is structured around **2 Main Core Modules**:

1. **💼 Career Module**: AI-driven career matching, skill gap analysis, research readiness scoring, 4-phase career roadmaps, and real-time job/internship discovery.
2. **🔬 Research Module**: Full-lifecycle research workspace featuring ArXiv paper discovery, FAISS RAG-vector indexing, LLM research assistance, side-by-side paper comparison, multi-format AI paper drafting (IEEE/Springer/APA), DocSpace rich editor, guided research planning, and peer contribution tools.

---

## 🌟 Architecture Overview

```
                                  ┌─────────────────────────────────────────┐
                                  │               CLARION AI                │
                                  └────────────────────┬────────────────────┘
                                                       │
                   ┌───────────────────────────────────┴───────────────────────────────────┐
                   │                                                                       │
        ┌──────────┴──────────┐                                                 ┌──────────┴──────────┐
        │   CAREER MODULE     │                                                 │   RESEARCH MODULE   │
        └──────────┬──────────┘                                                 └──────────┬──────────┘
                   │                                                                       │
 ┌─────────────────┼─────────────────┐                                 ┌───────────────────┼───────────────────┐
 │                 │                 │                                 │                   │                   │
 ▼                 ▼                 ▼                                 ▼                   ▼                   ▼
Skill Gap     Readiness       Automated Job                        ArXiv & RAG       AI Paper Drafter     Collaborative
Engine        Score (5D)      Opportunities                        Assistant         & DocSpace           Contributions
```

---

## 💼 Module 1: Career Module (Career Intelligence & Readiness)

The Career Module helps students, researchers, and engineers map their technical skills to scientific career paths, identify skill gaps, evaluate research readiness, and apply for active opportunities.

### Key Capabilities:
- **12 Curated AI & Scientific Career Tracks**:
  - AI/ML Researcher (NeurIPS/ICML focus)
  - Generative AI Researcher (LLMs, Diffusion Models)
  - Computer Vision Researcher (CNNs, 3D Vision, Medical Imaging)
  - NLP Researcher (Transformers, Translation, Dialogue)
  - Data Science Researcher (Causal Inference, Bayesian Stats)
  - Robotics Researcher (ROS, Control Theory, Perception)
  - Cybersecurity Researcher (Cryptography, Threat Modeling)
  - Healthcare AI Researcher (Diagnostics, Genomics)
  - Data Mining Researcher (Knowledge Graphs, Anomaly Detection)
  - Software Systems Researcher (Compilers, Distributed Systems)
  - Quantum AI Researcher (Qiskit, Quantum Neural Nets)
  - Bioinformatics & Genomics Researcher (Molecular Modeling, BLAST)

- **🎯 Skill Matching & Gap Analysis Engine**:
  - Profile skill tracking with proficiency weighting (`Beginner` 0.3, `Intermediate` 0.65, `Advanced` 1.0).
  - Categorizes skills into **Strong Matches**, **Skills to Improve**, and **Critical Skill Gaps**.

- **📊 5-Dimension Research Readiness Score**:
  Evaluates overall career readiness on a 100-point scale across 5 weighted dimensions:
  1. **Technical Skills** (35%)
  2. **Research Methodology** (25%)
  3. **Domain Knowledge** (20%)
  4. **Academic Writing** (12%)
  5. **Research Experience** (8%)

- **🗺️ 4-Phase Personalized Roadmap**:
  Generates custom action steps tailored to bridge skill gaps:
  - *Phase 1: Foundations* (Domain concepts & literature discovery)
  - *Phase 2: Research Methodology* (Experimental design & guide planning)
  - *Phase 3: Advanced Specialization* (Architectures & AI Assistant Q&A)
  - *Phase 4: Active Research & Publication* (Paper drafting & submission)

- **⚡ Real-Time Opportunities Aggregator**:
  Automated integration with **RapidAPI (JSearch)** to pull active research internships and assistantships from top institutions (Google DeepMind, OpenAI, Microsoft Research, Meta AI, etc.).

---

## 🔬 Module 2: Research Module (End-to-End AI Research Workspace)

The Research Module provides an end-to-end suite of tools for exploring literature, managing papers, asking context-aware research questions, drafting publications, and collaborating with peers.

### Key Capabilities:

- **🔍 Paper Discovery & ArXiv Integration**:
  - Live ArXiv search by domain or keyword query.
  - Preview abstracts, publication dates, and author metadata.
  - One-click import into personal library.

- **📚 Personal Research Library & Workspace**:
  - Upload local PDF research papers.
  - Organize papers by research domain.
  - Add notes, mark favorites, calculate paper impact scores, and download original files.

- **🤖 AI Research Assistant & RAG Pipeline**:
  - FAISS (Facebook AI Similarity Search) vector indexing with semantic text chunking.
  - Contextual Q&A using **Google Gemini** & **Groq LLaMA** models.
  - Extract research methodologies, key equations, and dataset references.

- **⚖️ Side-by-Side Paper Comparison**:
  - Compare two research papers side-by-side.
  - AI extraction of differences in methodology, dataset sizes, hardware requirements, and baseline benchmarks.

- **✍️ Multi-Format Paper Drafter**:
  - Auto-generates structured academic manuscripts based on user topic & domain input.
  - Supports standard publishing styles: **IEEE, Springer, APA, ACM, Elsevier**.
  - Fetches and embeds relevant ArXiv paper citations into draft reference sections.

- **📝 DocSpace Editor**:
  - Integrated rich text editor (similar to Google Docs).
  - Edit, format, structure, and export generated papers.

- **🧭 Guided Research Builder**:
  - 6-step guided path for research beginners:
    1. *Domain Selection*
    2. *ArXiv Paper Exploration*
    3. *Problem Statement Formulation*
    4. *Methodology Selection*
    5. *Experiment Design*
    6. *Gap Analysis & Readiness Evaluation*

- **🤝 Peer-to-Peer Contributions & Collaboration**:
  - Research issue board where paper owners can post open questions or task requests.
  - Peer contributors submit pitches and solutions.
  - Owners can review, accept, rate, and manage contributor teams.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios, React Quill |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose |
| **AI & RAG** | Google Gemini API, Groq LLaMA models, FAISS Node Vector Index, LLaMA Cloud |
| **Integrations** | ArXiv Search API, RapidAPI JSearch Jobs API |
| **Deployment** | Render (Web Service & Static Site via `render.yaml` Infrastructure-as-Code) |

---

## 📁 Repository Structure

```
project-hackathon/
├── client/                     # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Sidebar, Modals, Progress Panels)
│   │   ├── pages/              # Module Pages (Career, AiAssistant, DocSpace, Guide, Library, PaperDrafter, etc.)
│   │   ├── config.js           # API Base URL Config
│   │   └── main.jsx            # React Entrypoint
│   ├── package.json            # Client Dependencies
│   └── vite.config.js          # Vite Config
├── server/                     # Express.js Backend API
│   ├── controllers/            # Logic for Chatbot, ArXiv, Compare, Draft, Impact, etc.
│   ├── models/                 # Mongoose Schemas (User, Paper, Contribution, ResearchBuild, etc.)
│   ├── routes/                 # API Routes (careerRoutes, ragRoutes, draftRoutes, etc.)
│   ├── services/               # AI & RAG Pipeline (aiManager, faissService, chunker, pdfParser)
│   ├── index.js                # Express Server Entrypoint
│   ├── .env.example            # Environment Variable Template
│   └── package.json            # Server Dependencies
├── render.yaml                 # Render Blueprint Deployment Spec
└── README.md                   # Project Documentation
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Neshmitha/Gobal_Hackathon.git
cd Gobal_Hackathon
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory based on `server/.env.example`:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.p975hui.mongodb.net/ResearchPilot
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
LLAMA_CLOUD_API_KEY=your_llama_cloud_key
CLIENT_URL=http://localhost:5173
RAPIDAPI_KEY=your_rapidapi_jsearch_key
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:5001/api
```

### 3. Start Backend Server

```bash
cd server
npm install
npm run dev
```
*(Runs backend API at `http://localhost:5001`)*

### 4. Start Frontend Application

```bash
cd ../client
npm install
npm run dev
```
*(Runs frontend application at `http://localhost:5173`)*

---



