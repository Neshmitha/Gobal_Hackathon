/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Award, Star, Bot, Sparkles, Eye, FileText, BarChart2,
  Cpu, Shield, Activity, Layers, Code, Zap, FlaskConical, X, Plus,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, HelpCircle,
  Brain, Sliders, ExternalLink, RefreshCw, User, Compass, BookOpen, Search,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';
import AppSidebar from '../components/AppSidebar';


// Icon Map
const ICON_MAP = {
  Bot: Bot,
  Sparkles: Sparkles,
  Eye: Eye,
  FileText: FileText,
  BarChart2: BarChart2,
  Cpu: Cpu,
  Shield: Shield,
  Activity: Activity,
  Layers: Layers,
  Code: Code,
  Zap: Zap,
  FlaskConical: FlaskConical
};

// Skill Level Weights
const LEVEL_WEIGHT = {
  Beginner: 0.3,
  Intermediate: 0.65,
  Advanced: 1.0
};

// Fallback curated careers if server is unreachable
const INITIAL_CAREERS = [
  {
    id: "ai-ml-researcher",
    title: "AI/ML Researcher",
    icon: "Bot",
    description: "AI/ML Researchers design and develop machine learning algorithms, neural networks, and intelligent systems. They push the boundaries of AI through theoretical innovations and empirical experiments, publishing in top venues like NeurIPS, ICML, and ICLR.",
    technicalSkills: ["Python", "Machine Learning", "Deep Learning", "Statistics", "Linear Algebra", "PyTorch", "TensorFlow", "Data Structures"],
    researchSkills: ["Research Methodology", "Literature Review", "Academic Writing", "Experimental Design", "Critical Analysis", "Peer Review"],
    tools: ["PyTorch", "TensorFlow", "Jupyter", "NumPy", "Pandas", "Scikit-learn", "W&B", "Git"],
    researchAreas: ["Reinforcement Learning", "Meta-Learning", "AutoML", "Optimization Theory", "Bayesian Methods", "Graph Neural Networks"],
    opportunities: [
      { title: "ML Research Intern", org: "Google DeepMind", type: "Internship", required: ["Python", "Deep Learning", "Research Methodology"], url: "https://deepmind.google/careers/" },
      { title: "AI Research Assistant", org: "University Lab", "type": "Research Assistantship", required: ["Python", "Machine Learning", "Statistics"], url: "#" },
      { title: "Student Researcher – ML", org: "Microsoft Research", type: "Student Research", required: ["Python", "Linear Algebra", "Academic Writing"], url: "https://www.microsoft.com/en-us/research/careers/" }
    ]
  },
  {
    id: "generative-ai-researcher",
    title: "Generative AI Researcher",
    icon: "Sparkles",
    description: "Generative AI Researchers focus on building models that generate text, images, audio, and video. They work on foundation models, diffusion models, LLMs, and multi-modal systems.",
    technicalSkills: ["Python", "Deep Learning", "Transformer Architecture", "Diffusion Models", "NLP", "Statistics", "PyTorch", "CUDA"],
    researchSkills: ["Research Methodology", "Literature Review", "Experimental Design", "Academic Writing", "Critical Analysis"],
    tools: ["PyTorch", "HuggingFace", "Diffusers", "LangChain", "OpenAI API", "Jupyter", "Git", "Docker"],
    researchAreas: ["Large Language Models", "Diffusion Models", "Multi-modal AI", "AI Safety", "RLHF", "Prompt Engineering"],
    opportunities: [
      { title: "Generative AI Research Intern", org: "OpenAI", type: "Internship", required: ["Python", "Deep Learning", "NLP", "Research Methodology"], url: "https://openai.com/careers/" }
    ]
  },
  {
    id: "computer-vision-researcher",
    title: "Computer Vision Researcher",
    icon: "Eye",
    description: "Computer Vision Researchers develop algorithms that enable machines to interpret visual information from the real world, working on object detection, 3D reconstruction, and medical imaging.",
    technicalSkills: ["Python", "Deep Learning", "CNN", "Image Processing", "Linear Algebra", "PyTorch", "OpenCV", "Mathematics"],
    researchSkills: ["Research Methodology", "Experimental Design", "Data Collection", "Academic Writing", "Literature Review"],
    tools: ["PyTorch", "OpenCV", "TensorFlow", "YOLO", "Detectron2", "NumPy", "Matplotlib", "Git"],
    researchAreas: ["Object Detection", "3D Vision", "Medical Imaging", "Video Understanding", "Scene Understanding", "Autonomous Driving"],
    opportunities: [
      { title: "CV Research Intern", org: "Meta AI Research", type: "Internship", required: ["Python", "CNN", "PyTorch", "Research Methodology"], url: "https://ai.meta.com/careers/" }
    ]
  },
  {
    id: "nlp-researcher",
    title: "NLP Researcher",
    icon: "FileText",
    description: "NLP Researchers study and build systems that understand, process, and generate human language, spanning machine translation, sentiment analysis, and large language models.",
    technicalSkills: ["Python", "NLP", "Deep Learning", "Linguistics", "Statistics", "Transformer Architecture", "HuggingFace", "Machine Learning"],
    researchSkills: ["Research Methodology", "Data Annotation", "Experimental Design", "Academic Writing", "Literature Review"],
    tools: ["HuggingFace", "NLTK", "spaCy", "PyTorch", "Jupyter", "Pandas", "Git", "Weights & Biases"],
    researchAreas: ["Machine Translation", "Question Answering", "Sentiment Analysis", "Information Extraction", "Dialogue Systems", "Text Generation"],
    opportunities: [
      { title: "NLP Research Intern", org: "Google Research", type: "Internship", required: ["Python", "NLP", "Deep Learning", "Academic Writing"], url: "https://research.google/careers/" }
    ]
  },
  {
    id: "data-science-researcher",
    title: "Data Science Researcher",
    icon: "BarChart2",
    description: "Data Science Researchers combine statistical modeling, machine learning, and domain expertise to extract insights from large-scale datasets.",
    technicalSkills: ["Python", "Statistics", "Machine Learning", "Data Analysis", "SQL", "R", "Visualization", "Probability"],
    researchSkills: ["Research Methodology", "Statistical Analysis", "Data Collection", "Academic Writing", "Critical Analysis"],
    tools: ["Python", "R", "SQL", "Tableau", "Pandas", "Scikit-learn", "Jupyter", "Git"],
    researchAreas: ["Causal Inference", "Bayesian Statistics", "Survey Research", "Time Series", "Spatial Analysis", "A/B Testing"],
    opportunities: [
      { title: "Data Science Research Intern", org: "Netflix Research", type: "Internship", required: ["Python", "Statistics", "Machine Learning", "Research Methodology"], url: "https://research.netflix.com/" }
    ]
  },
  {
    id: "robotics-researcher",
    title: "Robotics Researcher",
    icon: "Cpu",
    description: "Robotics Researchers develop intelligent physical systems that perceive, reason, and act in the real world across control theory, computer vision, and AI.",
    technicalSkills: ["Python", "ROS", "Control Theory", "Computer Vision", "Deep Learning", "C++", "Linear Algebra", "Kinematics"],
    researchSkills: ["Research Methodology", "Experimental Design", "Hardware Prototyping", "Academic Writing", "Safety Analysis"],
    tools: ["ROS", "Gazebo", "PyTorch", "OpenCV", "MoveIt", "MATLAB", "Git", "Arduino"],
    researchAreas: ["Autonomous Navigation", "Manipulation", "Human-Robot Interaction", "Swarm Robotics", "Soft Robotics", "Aerial Robotics"],
    opportunities: [
      { title: "Robotics Research Intern", org: "Boston Dynamics", type: "Internship", required: ["Python", "ROS", "Control Theory", "Research Methodology"], url: "https://bostondynamics.com/careers/" }
    ]
  },
  {
    id: "cybersecurity-researcher",
    title: "Cybersecurity Researcher",
    icon: "Shield",
    description: "Cybersecurity Researchers study attack surfaces, vulnerabilities, and defense mechanisms, performing threat modeling, reverse engineering, and cryptographic protocols.",
    technicalSkills: ["Python", "Networking", "Cryptography", "Linux", "Reverse Engineering", "Machine Learning", "C/C++", "Security Protocols"],
    researchSkills: ["Research Methodology", "Threat Analysis", "Vulnerability Assessment", "Academic Writing", "Ethical Research"],
    tools: ["Wireshark", "Metasploit", "Ghidra", "Burp Suite", "Python", "Nmap", "Docker", "Git"],
    researchAreas: ["Malware Analysis", "Network Security", "Privacy Engineering", "AI Security", "Cryptography", "IoT Security"],
    opportunities: [
      { title: "Security Research Intern", org: "Cloudflare Research", type: "Internship", required: ["Python", "Networking", "Cryptography", "Research Methodology"], url: "https://cloudflare.com/careers/" }
    ]
  },
  {
    id: "healthcare-ai-researcher",
    title: "Healthcare AI Researcher",
    icon: "Activity",
    description: "Healthcare AI Researchers apply machine learning to medical diagnostics, treatment planning, drug discovery, and clinical decision support.",
    technicalSkills: ["Python", "Machine Learning", "Bioinformatics", "Statistics", "Deep Learning", "Medical Image Analysis", "Data Analysis", "R"],
    researchSkills: ["Research Methodology", "Clinical Study Design", "Data Ethics", "Academic Writing", "IRB Protocols"],
    tools: ["Python", "R", "TensorFlow", "PyTorch", "MATLAB", "MONAI", "SPSS", "Jupyter"],
    researchAreas: ["Medical Image Diagnosis", "Drug Discovery", "Genomics", "Clinical NLP", "Predictive Health", "Federated Learning"],
    opportunities: [
      { title: "Healthcare AI Research Intern", org: "Google Health", type: "Internship", required: ["Python", "Deep Learning", "Medical Image Analysis", "Research Methodology"], url: "https://health.google/careers/" }
    ]
  },
  {
    id: "data-mining-researcher",
    title: "Data Mining Researcher",
    icon: "Layers",
    description: "Data Mining Researchers develop algorithms to discover patterns, anomalies, and insights from large-scale datasets.",
    technicalSkills: ["Python", "Data Mining", "Machine Learning", "SQL", "Graph Algorithms", "Statistics", "Pattern Recognition", "Big Data"],
    researchSkills: ["Research Methodology", "Algorithm Design", "Benchmarking", "Academic Writing", "Literature Review"],
    tools: ["Python", "Spark", "Hadoop", "Neo4j", "SQL", "Scikit-learn", "D3.js", "Git"],
    researchAreas: ["Knowledge Graph Mining", "Anomaly Detection", "Sequential Pattern Mining", "Social Network Analysis", "Recommender Systems", "Stream Mining"],
    opportunities: [
      { title: "Data Mining Research Intern", org: "Amazon Research", type: "Internship", required: ["Python", "Data Mining", "Machine Learning", "SQL"], url: "https://www.amazon.science/careers/" }
    ]
  },
  {
    id: "software-systems-researcher",
    title: "Software Systems Researcher",
    icon: "Code",
    description: "Software Systems Researchers study programming languages, compilers, operating systems, distributed computing, and formal verification.",
    technicalSkills: ["C/C++", "Systems Programming", "Algorithms", "Operating Systems", "Distributed Systems", "Formal Methods", "Python", "Computer Architecture"],
    researchSkills: ["Research Methodology", "Formal Verification", "Benchmarking", "Academic Writing", "Proof Writing"],
    tools: ["GCC", "LLVM", "Linux Kernel", "Git", "Valgrind", "Perf", "Docker", "Z3 Solver"],
    researchAreas: ["Programming Languages", "Distributed Systems", "Compiler Optimization", "OS Internals", "Formal Verification", "Cloud Systems"],
    opportunities: [
      { title: "Systems Research Intern", "org": "Microsoft Research", type: "Internship", required: ["C/C++", "Systems Programming", "Algorithms", "Research Methodology"], url: "https://www.microsoft.com/en-us/research/careers/" }
    ]
  },
  {
    id: "quantum-ai-researcher",
    title: "Quantum AI Researcher",
    icon: "Zap",
    description: "Quantum AI Researchers explore the intersection of quantum computing and machine learning, developing quantum neural networks and hybrid models.",
    technicalSkills: ["Python", "Quantum Computing", "Linear Algebra", "Quantum Algorithms", "PyTorch", "Qiskit", "Physics", "Machine Learning"],
    researchSkills: ["Research Methodology", "Theoretical Analysis", "Experimental Design", "Academic Writing", "Literature Review"],
    tools: ["Qiskit", "Cirq", "PennyLane", "PyTorch", "Jupyter", "NumPy", "Git"],
    researchAreas: ["Quantum Machine Learning", "Variational Quantum Algorithms", "Quantum Optimization", "Quantum Neural Networks", "Quantum Error Correction"],
    opportunities: [
      { title: "Quantum Research Intern", org: "IBM Quantum", type: "Internship", required: ["Python", "Quantum Computing", "Qiskit"], url: "https://www.ibm.com/quantum" }
    ]
  },
  {
    id: "bioinformatics-researcher",
    title: "Bioinformatics & Genomics Researcher",
    icon: "FlaskConical",
    description: "Bioinformatics Researchers process and model biological data such as DNA sequences, proteins, and molecular structures to advance computational biology.",
    technicalSkills: ["Python", "R", "Bioinformatics", "Genomics", "Statistics", "Machine Learning", "Data Analysis", "Molecular Biology"],
    researchSkills: ["Research Methodology", "Sequence Analysis", "Statistical Modeling", "Academic Writing", "Data Ethics"],
    tools: ["Biopython", "R", "BLAST", "PyMOL", "Pandas", "Jupyter", "Git", "Nextflow"],
    researchAreas: ["Genomic Sequence Alignment", "Protein Structure Prediction", "Phylogenetics", "Metagenomics", "Single-cell RNA-seq"],
    opportunities: [
      { title: "Genomics Research Intern", org: "Illumina Research", type: "Internship", required: ["Python", "Bioinformatics", "Genomics"], url: "https://www.illumina.com/" }
    ]
  }
];

// Helper algorithm: Normalize Skill object/string
function normalizeSkill(s) {
  if (!s) return null;
  if (typeof s === 'string') {
    return { name: s.trim(), level: 'Intermediate' };
  }
  if (typeof s === 'object') {
    const name = s.name || s.title || s.label || '';
    const level = s.level || 'Intermediate';
    return name ? { name: String(name).trim(), level } : null;
  }
  return null;
}

// Helper algorithm: Compute Career Match %
function computeCareerMatch(userSkills, career) {
  if (!career) return 0;
  const allRequired = [...new Set([...(career.technicalSkills || []), ...(career.researchSkills || [])])];
  if (allRequired.length === 0) return 0;

  const skillMap = {};
  (userSkills || []).forEach(s => {
    const norm = normalizeSkill(s);
    if (norm) {
      skillMap[norm.name.toLowerCase()] = LEVEL_WEIGHT[norm.level] || 0.65;
    }
  });

  let totalScore = 0;
  allRequired.forEach(skill => {
    const key = skill.toLowerCase().trim();
    const matchKey = Object.keys(skillMap).find(k => k === key || k.includes(key.split(' ')[0]) || key.includes(k.split(' ')[0]));
    totalScore += matchKey ? skillMap[matchKey] : 0;
  });

  return Math.min(100, Math.round((totalScore / allRequired.length) * 100));
}

// Helper algorithm: Skill Gap Analysis
function computeGapAnalysis(userSkills, career) {
  if (!career) return { strong: [], toImprove: [], gaps: [] };
  const allRequired = [...new Set([...(career.technicalSkills || []), ...(career.researchSkills || [])])];
  
  const skillMap = {};
  (userSkills || []).forEach(s => {
    const norm = normalizeSkill(s);
    if (norm) {
      skillMap[norm.name.toLowerCase()] = { level: norm.level, weight: LEVEL_WEIGHT[norm.level] || 0.65, rawName: norm.name };
    }
  });

  const strong = [];
  const toImprove = [];
  const gaps = [];

  allRequired.forEach(skill => {
    const key = skill.toLowerCase().trim();
    const matchKey = Object.keys(skillMap).find(k => k === key || k.includes(key.split(' ')[0]) || key.includes(k.split(' ')[0]));
    
    if (matchKey) {
      const matchObj = skillMap[matchKey];
      if (matchObj.weight >= 0.65) {
        strong.push({ name: skill, userLevel: matchObj.level });
      } else {
        toImprove.push({ name: skill, userLevel: matchObj.level });
      }
    } else {
      gaps.push({ name: skill });
    }
  });

  return { strong, toImprove, gaps };
}

// Helper algorithm: 5-Dimension Research Readiness Score
function computeReadiness(userSkills, career) {
  if (!career) return { total: 0, breakdown: [] };
  const matchPct = computeCareerMatch(userSkills, career);
  const gap = computeGapAnalysis(userSkills, career);

  const techScore = Math.min(100, Math.round((gap.strong.length / Math.max(1, career.technicalSkills.length)) * 100 * 0.95 + matchPct * 0.05));
  const researchScore = Math.min(100, Math.round((gap.strong.filter(s => career.researchSkills.includes(s.name)).length / Math.max(1, career.researchSkills.length)) * 100 * 0.9 + matchPct * 0.1));
  const domainScore = Math.min(100, Math.round(matchPct * 0.85 + (userSkills.length > 3 ? 15 : 5)));
  const writingScore = userSkills.some(s => s.name.toLowerCase().includes('writing') || s.name.toLowerCase().includes('paper') || s.name.toLowerCase().includes('research')) ? 85 : 50;
  const expScore = userSkills.length > 5 ? 75 : userSkills.length > 2 ? 55 : 35;

  const total = Math.min(100, Math.round(
    techScore * 0.35 +
    researchScore * 0.25 +
    domainScore * 0.20 +
    writingScore * 0.12 +
    expScore * 0.08
  ));

  return {
    total,
    breakdown: [
      { label: "Technical Skills", weight: "35%", score: techScore },
      { label: "Research Methodology", weight: "25%", score: researchScore },
      { label: "Domain Knowledge", weight: "20%", score: domainScore },
      { label: "Academic Writing", weight: "12%", score: writingScore },
      { label: "Research Experience", weight: "8%", score: expScore }
    ]
  };
}

// Helper algorithm: 4-Phase Personalized Roadmap
function generateRoadmap(userSkills, career) {
  if (!career) return [];
  const gap = computeGapAnalysis(userSkills, career);
  
  return [
    {
      phase: 1,
      title: "Phase 1: Foundations",
      subtitle: "Build core domain concepts & literature background",
      gaps: gap.gaps.slice(0, 3).map(g => g.name),
      actionText: "Discover Papers",
      actionPath: "/search"
    },
    {
      phase: 2,
      title: "Phase 2: Research Methodology",
      subtitle: "Master experimental design & academic writing",
      gaps: career.researchSkills.slice(0, 3),
      actionText: "Research Guide",
      actionPath: "/guide"
    },
    {
      phase: 3,
      title: "Phase 3: Advanced Specialization",
      subtitle: "Implement state-of-the-art architectures & tools",
      gaps: gap.toImprove.slice(0, 3).map(g => g.name).concat(career.tools.slice(0, 2)),
      actionText: "AI Assistant",
      actionPath: "/ai"
    },
    {
      phase: 4,
      title: "Phase 4: Active Research & Publication",
      subtitle: "Draft research papers & apply for internships",
      gaps: ["Manuscript Drafting", "Peer Review Prep", "Code Benchmarking"],
      actionText: "Paper Drafting",
      actionPath: "/draft"
    }
  ];
}

// Dynamic Fit Badge Component
const FitBadge = ({ matchPct }) => {
  if (matchPct >= 80) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Top Match • Best Fit
      </span>
    );
  } else if (matchPct >= 60) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        Recommended Fit
      </span>
    );
  } else if (matchPct >= 40) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        Good Potential
      </span>
    );
  } else {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gray-500/15 text-gray-400 border border-gray-500/30 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        Building Foundations
      </span>
    );
  }
};

const Career = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => (localStorage.getItem('theme') || 'dark') === 'dark');

  // User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { username: 'Researcher', email: 'user@clarion.ai', skills: [] };
  });

  // Skills State (default initial skills if user has none)
  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.skills && u.skills.length > 0) return u.skills;
    }
    return [
      { name: "Python", level: "Intermediate" },
      { name: "Machine Learning", level: "Beginner" },
      { name: "Deep Learning", level: "Beginner" },
      { name: "Statistics", level: "Intermediate" }
    ];
  });

  // Careers Data
  const [careers, setCareers] = useState(INITIAL_CAREERS);

  // Modal States
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'gap' | 'roadmap'
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isOppsModalOpen, setIsOppsModalOpen] = useState(false);

  // New Skill Input State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Listen for global theme & skill update events
  useEffect(() => {
    const handleThemeChange = (e) => setIsDark(e.detail === 'dark');
    window.addEventListener('themeChange', handleThemeChange);

    const handleSkillUpdate = (e) => {
      if (e.detail) {
        setSkills(e.detail);
      }
    };
    window.addEventListener('userSkillsUpdated', handleSkillUpdate);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('userSkillsUpdated', handleSkillUpdate);
    };
  }, []);

  // Fetch careers & profile skills from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCareers = await axios.get(`${API_BASE_URL}/career/careers`);
        if (resCareers.data && Array.isArray(resCareers.data)) {
          setCareers(resCareers.data);
        }
      } catch (err) {
        console.warn('Server offline or network error, using local curated career model.', err.message);
      }

      // Fetch Profile skills if user ID is available
      const userId = user.id || user._id;
      if (userId) {
        try {
          const resProfile = await axios.get(`${API_BASE_URL}/career/profile?userId=${userId}`);
          if (resProfile.data && resProfile.data.skills && resProfile.data.skills.length > 0) {
            setSkills(resProfile.data.skills);
            const updatedUser = { ...user, skills: resProfile.data.skills };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.warn('Could not fetch user skills from server:', err.message);
        }
      }
    };

    fetchData();
  }, []);

  // Sync skills helper
  const syncSkills = async (updatedSkills) => {
    setSkills(updatedSkills);
    const updatedUser = { ...user, skills: updatedSkills };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Dispatch global window event
    window.dispatchEvent(new CustomEvent('userSkillsUpdated', { detail: updatedSkills }));

    // Send update to MongoDB backend
    const userId = user.id || user._id;
    if (userId) {
      try {
        await axios.put(`${API_BASE_URL}/career/profile`, { userId, skills: updatedSkills });
      } catch (err) {
        console.error('Failed to sync skills with database:', err);
      }
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const nameToAdd = newSkillName.trim();
    const normalizedList = skills.map(normalizeSkill).filter(Boolean);
    const existingIndex = normalizedList.findIndex(s => s.name.toLowerCase() === nameToAdd.toLowerCase());
    let updated;
    if (existingIndex >= 0) {
      updated = [...normalizedList];
      updated[existingIndex] = { name: nameToAdd, level: newSkillLevel };
    } else {
      updated = [...normalizedList, { name: nameToAdd, level: newSkillLevel }];
    }
    setNewSkillName('');
    syncSkills(updated);
  };

  const handleRemoveSkill = (skillNameToRemove) => {
    const updated = skills
      .map(normalizeSkill)
      .filter(Boolean)
      .filter(s => s.name.toLowerCase() !== String(skillNameToRemove).toLowerCase());
    syncSkills(updated);
  };

  // Compute sorted careers by match percentage descending
  const sortedCareers = useMemo(() => {
    return [...careers].map(career => {
      const matchPct = computeCareerMatch(skills, career);
      return { ...career, matchPct };
    }).sort((a, b) => b.matchPct - a.matchPct);
  }, [careers, skills]);

  // Extract all opportunities across careers with calculated match %
  const allOpportunities = useMemo(() => {
    const list = [];
    const normalizedSkills = skills.map(normalizeSkill).filter(Boolean);
    careers.forEach(career => {
      if (career.opportunities) {
        career.opportunities.forEach(opp => {
          const req = opp.required || [];
          let score = 0;
          req.forEach(r => {
            const hasSkill = normalizedSkills.some(s => s.name.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.name.toLowerCase()));
            if (hasSkill) score += 1;
          });
          const matchPct = req.length > 0 ? Math.round((score / req.length) * 100) : 75;
          list.push({ ...opp, careerTitle: career.title, matchPct });
        });
      }
    });
    return list.sort((a, b) => b.matchPct - a.matchPct);
  }, [careers, skills]);

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      {/* Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        activePage="career"
        isDark={isDark}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Scrollable Content View */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto space-y-8"
          >
            
            {/* Header Action Bar */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-[#0284c7] border border-cyan-200'}`}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">Research Careers</h1>
                    <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Skill-to-Job Matching & Research Readiness
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* My Skills Button */}
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md border hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-white/5 text-white border-white/15 hover:bg-white/10 hover:border-cyan-400/50'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-[#38bdf8] shadow-gray-200/50'
                  }`}
                >
                  <Brain size={18} className="text-[#38bdf8]" />
                  <span>My Skills</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#38bdf8]/20 text-[#38bdf8]">
                    {skills.length}
                  </span>
                </button>

                {/* Research Opportunities Button */}
                <button
                  onClick={() => setIsOppsModalOpen(true)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md border hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-white/5 text-white border-white/15 hover:bg-white/10 hover:border-cyan-400/50'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-[#38bdf8] shadow-gray-200/50'
                  }`}
                >
                  <Sparkles size={18} className="text-amber-400" />
                  <span>Research Opportunities</span>
                </button>

                {/* Profile Avatar Button */}
                <button
                  onClick={() => navigate('/settings')}
                  title="View Profile & Settings"
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-200 border shadow-lg hover:scale-105 ${
                    isDark
                      ? 'bg-[#000000] border-[#38bdf8]/40 text-[#38bdf8] shadow-[#38bdf8]/20 hover:border-[#38bdf8]'
                      : 'bg-white text-[#0284c7] border-[#38bdf8]/30 shadow-[#38bdf8]/30'
                  }`}
                >
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </button>
              </div>
            </header>

            {/* Direct Career Grid Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight">Explore Research Careers</h2>
                    
                  </div>
                  
                </div>
                
              </div>

              {/* Grid of 12 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCareers.map((career, index) => {
                  const IconComponent = ICON_MAP[career.icon] || Briefcase;
                  const matchPct = career.matchPct;

                  return (
                    <motion.div
                      key={career.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.02, 0.2),
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCareer(career);
                        setActiveTab('overview');
                      }}
                      className={`group relative cursor-pointer rounded-[28px] p-6 flex flex-col justify-between backdrop-blur-md border transition-all duration-300 shadow-xl ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:border-[#38bdf8]/50 hover:bg-white/[0.07] hover:shadow-[#38bdf8]/10'
                          : 'bg-white border-gray-200 hover:border-[#38bdf8] shadow-blue-900/5 hover:shadow-cyan-500/10'
                      }`}
                    >
                      {/* Top Row: Icon + Badges */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className={`p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                            isDark
                              ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                              : 'bg-[#e0f2fe] text-[#0284c7] border border-[#38bdf8]/30'
                          }`}>
                            <IconComponent size={24} />
                          </div>

                          {/* Match Badge */}
                          <div className="text-right">
                            <span className="text-2xl font-black tracking-tight text-[#38bdf8]">
                              {matchPct}%
                            </span>
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
                              Skill Match
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="text-lg font-black tracking-tight group-hover:text-[#38bdf8] transition-colors">
                              {career.title}
                            </h3>
                          </div>
                          <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {career.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Section: Fit status & Action */}
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                        <FitBadge matchPct={matchPct} />

                        <div className="flex items-center gap-1 text-xs font-bold text-[#38bdf8] group-hover:translate-x-1 transition-transform">
                          <span>Analyze</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </div>
      </main>

      {/* ── MODAL 1: CAREER DETAILS & SKILL GAP MODAL ── */}
      <AnimatePresence>
        {selectedCareer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCareer(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`relative w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl z-10 border ${
                isDark
                  ? 'bg-[#0b1329]/95 border-sky-500/20 text-white shadow-[0_0_50px_rgba(2,132,199,0.15)]'
                  : 'bg-white/95 border-sky-100 text-slate-900 shadow-2xl shadow-sky-900/10'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-6 sm:p-8 border-b flex items-start justify-between gap-4 bg-gradient-to-r ${
                isDark
                  ? 'from-cyan-950/40 via-sky-950/20 to-transparent border-white/10'
                  : 'from-cyan-50/80 via-sky-50/40 to-transparent border-sky-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-100/80 text-[#0284c7] border border-cyan-200'}`}>
                    {React.createElement(ICON_MAP[selectedCareer.icon] || Briefcase, { size: 28 })}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedCareer.title}
                      </h2>
                      <FitBadge matchPct={computeCareerMatch(skills, selectedCareer)} />
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Target Role • Match Percentage: <span className={`font-black ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>{computeCareerMatch(skills, selectedCareer)}%</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCareer(null)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Tab Navigation */}
              <div className={`flex items-center gap-2 px-6 pt-3 border-b ${
                isDark ? 'border-white/10 bg-black/40' : 'border-slate-200/80 bg-slate-50/80'
              }`}>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-2xl transition-all border-b-2 ${
                    activeTab === 'overview'
                      ? isDark
                        ? 'border-[#38bdf8] text-[#38bdf8] bg-cyan-500/10'
                        : 'border-[#0284c7] text-[#0284c7] bg-white font-extrabold shadow-xs'
                      : isDark
                        ? 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Overview & Skills
                </button>
                <button
                  onClick={() => setActiveTab('gap')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-2xl transition-all border-b-2 ${
                    activeTab === 'gap'
                      ? isDark
                        ? 'border-[#38bdf8] text-[#38bdf8] bg-cyan-500/10'
                        : 'border-[#0284c7] text-[#0284c7] bg-white font-extrabold shadow-xs'
                      : isDark
                        ? 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Skill Gap Analysis
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-2xl transition-all border-b-2 ${
                    activeTab === 'roadmap'
                      ? isDark
                        ? 'border-[#38bdf8] text-[#38bdf8] bg-cyan-500/10'
                        : 'border-[#0284c7] text-[#0284c7] bg-white font-extrabold shadow-xs'
                      : isDark
                        ? 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Personalized Roadmap
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 scrollbar-hide">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>
                        Role Overview
                      </h4>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        {selectedCareer.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Technical Skills */}
                      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/80 border-slate-200/80 shadow-xs'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>
                          <Code size={16} /> Required Technical Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCareer.technicalSkills.map((sk, i) => (
                            <span key={i} className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                              isDark
                                ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                                : 'bg-sky-50 text-sky-700 border-sky-200/80 shadow-2xs'
                            }`}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Research Skills */}
                      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/80 border-slate-200/80 shadow-xs'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>
                          <Award size={16} /> Required Research Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCareer.researchSkills.map((sk, i) => (
                            <span key={i} className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                              isDark
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                : 'bg-purple-50 text-purple-700 border-purple-200/80 shadow-2xs'
                            }`}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tools & Tech */}
                      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/80 border-slate-200/80 shadow-xs'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>
                          <Sliders size={16} /> Key Tools & Frameworks
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCareer.tools.map((tl, i) => (
                            <span key={i} className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                              isDark
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs'
                            }`}>
                              {tl}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Research Areas */}
                      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/80 border-slate-200/80 shadow-xs'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>
                          <Star size={16} /> Primary Research Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCareer.researchAreas.map((ra, i) => (
                            <span key={i} className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                              isDark
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs'
                            }`}>
                              {ra}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SKILL GAP ANALYSIS */}
                {activeTab === 'gap' && (() => {
                  const matchPct = computeCareerMatch(skills, selectedCareer);
                  const gap = computeGapAnalysis(skills, selectedCareer);
                  const readiness = computeReadiness(skills, selectedCareer);

                  return (
                    <div className="space-y-6">
                      {/* Top Score Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Overall Match */}
                        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
                          isDark
                            ? 'bg-gradient-to-br from-sky-950/50 to-blue-900/30 border-sky-500/30 text-white'
                            : 'bg-gradient-to-br from-sky-50 to-blue-50/80 border-sky-200 text-slate-900 shadow-xs'
                        }`}>
                          <div>
                            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-sky-400' : 'text-[#0284c7]'}`}>
                              Career Match Score
                            </span>
                            <div className={`text-4xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {matchPct}%
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                              Based on PS3 Skill Matching
                            </p>
                          </div>
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-lg ${
                            isDark
                              ? 'border-sky-400 text-sky-400 bg-sky-500/10'
                              : 'border-[#0284c7] text-[#0284c7] bg-white shadow-xs'
                          }`}>
                            {matchPct}%
                          </div>
                        </div>

                        {/* Research Readiness */}
                        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
                          isDark
                            ? 'bg-gradient-to-br from-purple-950/50 to-indigo-900/30 border-purple-500/30 text-white'
                            : 'bg-gradient-to-br from-purple-50 to-indigo-50/80 border-purple-200 text-slate-900 shadow-xs'
                        }`}>
                          <div>
                            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                              Research Readiness Score
                            </span>
                            <div className={`text-4xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {readiness.total}<span className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>/100</span>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                              Across 5 Research Dimensions
                            </p>
                          </div>
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-lg ${
                            isDark
                              ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                              : 'border-purple-600 text-purple-600 bg-white shadow-xs'
                          }`}>
                            {readiness.total}
                          </div>
                        </div>
                      </div>

                      {/* 3-Column Gap Categorization */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Strong Skills */}
                        <div className={`p-5 rounded-2xl border ${
                          isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              Strong Skills ({gap.strong.length})
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {gap.strong.length === 0 ? (
                              <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>No strong skills yet</p>
                            ) : (
                              gap.strong.map((s, idx) => (
                                <div key={idx} className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                                  isDark ? 'bg-black/40 border-emerald-500/20 text-white' : 'bg-white border-emerald-200 text-slate-800 shadow-2xs'
                                }`}>
                                  <span>{s.name}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {s.userLevel}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Skills to Improve */}
                        <div className={`p-5 rounded-2xl border ${
                          isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/60 border-amber-200 shadow-xs'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                              To Improve ({gap.toImprove.length})
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {gap.toImprove.length === 0 ? (
                              <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>None to improve</p>
                            ) : (
                              gap.toImprove.map((s, idx) => (
                                <div key={idx} className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                                  isDark ? 'bg-black/40 border-amber-500/20 text-white' : 'bg-white border-amber-200 text-slate-800 shadow-2xs'
                                }`}>
                                  <span>{s.name}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {s.userLevel}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Major Skill Gaps */}
                        <div className={`p-5 rounded-2xl border ${
                          isDark ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50/60 border-rose-200 shadow-xs'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <HelpCircle size={18} className={isDark ? 'text-rose-400' : 'text-rose-600'} />
                            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                              Major Gaps ({gap.gaps.length})
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {gap.gaps.length === 0 ? (
                              <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>No skill gaps found!</p>
                            ) : (
                              gap.gaps.map((s, idx) => (
                                <div key={idx} className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                                  isDark ? 'bg-black/40 border-rose-500/20 text-rose-300' : 'bg-white border-rose-200 text-rose-800 shadow-2xs'
                                }`}>
                                  <span>{s.name}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    Missing
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Readiness Dimensions Progress Bars */}
                      <div className={`p-5 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/80 border-slate-200/80 shadow-xs'
                      }`}>
                        <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>
                          5-Dimension Readiness Breakdown
                        </h4>
                        <div className="space-y-3">
                          {readiness.breakdown.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                                  {item.label} <span className={isDark ? 'text-gray-500' : 'text-slate-400'}>({item.weight})</span>
                                </span>
                                <span className={isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}>{item.score}%</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                                <div
                                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 3: PERSONALIZED ROADMAP */}
                {activeTab === 'roadmap' && (() => {
                  const roadmap = generateRoadmap(skills, selectedCareer);
                  return (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
                        isDark ? 'bg-sky-500/10 border-sky-500/20 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-900 shadow-2xs'
                      }`}>
                        <Compass size={20} className={`flex-shrink-0 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`} />
                        <span>This 4-phase learning path is personalized based on your detected skill gaps for <strong>{selectedCareer.title}</strong>.</span>
                      </div>

                      <div className="space-y-4">
                        {roadmap.map((step) => (
                          <div key={step.phase} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                              : 'bg-white border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md'
                          }`}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                                  {step.phase}
                                </span>
                                <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h4>
                              </div>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{step.subtitle}</p>
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {step.gaps.map((g, idx) => (
                                  <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    isDark ? 'bg-white/10 border-white/10 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}>
                                    Focus: {g}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedCareer(null);
                                navigate(step.actionPath);
                              }}
                              className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                            >
                              <span>{step.actionText}</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: MY SKILLS POPUP ── */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSkillModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-lg rounded-[32px] p-6 sm:p-8 overflow-hidden shadow-2xl z-10 border ${
                isDark
                  ? 'bg-[#0b1329]/95 border-sky-500/20 text-white shadow-[0_0_50px_rgba(2,132,199,0.15)]'
                  : 'bg-white/95 border-sky-100 text-slate-900 shadow-2xl shadow-sky-900/10'
              }`}
            >
              <div className={`flex items-center justify-between pb-4 border-b mb-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-cyan-500/10 text-[#38bdf8]' : 'bg-cyan-100 text-[#0284c7]'}`}>
                    <Brain size={22} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Skill Manager</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Syncs real-time across Clarion profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSkillModalOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. PyTorch, NLP)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className={`flex-1 rounded-2xl px-4 py-3 text-xs font-bold outline-none border transition-all ${
                      isDark
                        ? 'bg-black/50 border-white/15 text-white focus:border-[#38bdf8]'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0284c7]'
                    }`}
                  />

                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className={`rounded-2xl px-3 py-3 text-xs font-bold outline-none border ${
                      isDark ? 'bg-black border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Skills List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                {skills.map(normalizeSkill).filter(Boolean).length === 0 ? (
                  <p className={`text-xs text-center py-6 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                    No skills added yet. Add your technical & research skills above!
                  </p>
                ) : (
                  skills.map(normalizeSkill).filter(Boolean).map((skill, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                          isDark ? 'bg-cyan-500/15 text-[#38bdf8] border-cyan-500/30' : 'bg-cyan-50 text-[#0284c7] border-cyan-200'
                        }`}>
                          {skill.level}
                        </span>
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: STUDENT RESEARCH OPPORTUNITIES POPUP ── */}
      <AnimatePresence>
        {isOppsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOppsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-3xl max-h-[85vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl z-10 border ${
                isDark
                  ? 'bg-[#0b1329]/95 border-sky-500/20 text-white shadow-[0_0_50px_rgba(2,132,199,0.15)]'
                  : 'bg-white/95 border-sky-100 text-slate-900 shadow-2xl shadow-sky-900/10'
              }`}
            >
              <div className={`p-6 border-b flex items-center justify-between bg-gradient-to-r ${
                isDark
                  ? 'from-amber-950/30 via-transparent to-transparent border-white/10'
                  : 'from-amber-50/80 via-transparent to-transparent border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Research Opportunities</h2>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Internships, RA posts & Student Research fellowships</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOppsModalOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Opportunities List */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-hide">
                {allOpportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:border-amber-400/50'
                        : 'bg-white border-slate-200/80 shadow-xs hover:border-amber-400/80 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isDark
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {opp.type}
                        </span>
                        <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>from {opp.careerTitle}</span>
                      </div>
                      <h4 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{opp.title}</h4>
                      <p className={`text-xs font-bold ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>{opp.org}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(opp.required || []).map((req, rIdx) => (
                          <span key={rIdx} className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            isDark ? 'bg-white/10 border-white/10 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            Req: {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span className={`text-lg font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{opp.matchPct}%</span>
                        <span className={`block text-[9px] uppercase font-bold ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>Match</span>
                      </div>
                      <a
                        href={opp.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                          isDark
                            ? 'bg-white/10 text-white hover:bg-amber-400 hover:text-black'
                            : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950'
                        }`}
                      >
                        <span>Apply</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Career;
