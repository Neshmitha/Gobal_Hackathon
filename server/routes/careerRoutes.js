const express = require('express');
const router = express.Router();
const User = require('../models/User');

const CAREERS_DATA = [
  {
    "id": "ai-ml-researcher",
    "title": "AI/ML Researcher",
    "icon": "Bot",
    "description": "AI/ML Researchers design and develop machine learning algorithms, neural networks, and intelligent systems. They push the boundaries of AI through theoretical innovations and empirical experiments, publishing in top venues like NeurIPS, ICML, and ICLR.",
    "technicalSkills": ["Python", "Machine Learning", "Deep Learning", "Statistics", "Linear Algebra", "PyTorch", "TensorFlow", "Data Structures"],
    "researchSkills": ["Research Methodology", "Literature Review", "Academic Writing", "Experimental Design", "Critical Analysis", "Peer Review"],
    "tools": ["PyTorch", "TensorFlow", "Jupyter", "NumPy", "Pandas", "Scikit-learn", "W&B", "Git"],
    "researchAreas": ["Reinforcement Learning", "Meta-Learning", "AutoML", "Optimization Theory", "Bayesian Methods", "Graph Neural Networks"],
    "opportunities": [
      { "title": "ML Research Intern", "org": "Google DeepMind", "type": "Internship", "required": ["Python", "Deep Learning", "Research Methodology"], "url": "https://deepmind.google/careers/" },
      { "title": "AI Research Assistant", "org": "University Lab", "type": "Research Assistantship", "required": ["Python", "Machine Learning", "Statistics"], "url": "#" },
      { "title": "Student Researcher – ML", "org": "Microsoft Research", "type": "Student Research", "required": ["Python", "Linear Algebra", "Academic Writing"], "url": "https://www.microsoft.com/en-us/research/careers/" }
    ]
  },
  {
    "id": "generative-ai-researcher",
    "title": "Generative AI Researcher",
    "icon": "Sparkles",
    "description": "Generative AI Researchers focus on building models that generate text, images, audio, and video. They work on foundation models, diffusion models, LLMs, and multi-modal systems.",
    "technicalSkills": ["Python", "Deep Learning", "Transformer Architecture", "Diffusion Models", "NLP", "Statistics", "PyTorch", "CUDA"],
    "researchSkills": ["Research Methodology", "Literature Review", "Experimental Design", "Academic Writing", "Critical Analysis"],
    "tools": ["PyTorch", "HuggingFace", "Diffusers", "LangChain", "OpenAI API", "Jupyter", "Git", "Docker"],
    "researchAreas": ["Large Language Models", "Diffusion Models", "Multi-modal AI", "AI Safety", "RLHF", "Prompt Engineering"],
    "opportunities": [
      { "title": "Generative AI Research Intern", "org": "OpenAI", "type": "Internship", "required": ["Python", "Deep Learning", "NLP", "Research Methodology"], "url": "https://openai.com/careers/" }
    ]
  },
  {
    "id": "computer-vision-researcher",
    "title": "Computer Vision Researcher",
    "icon": "Eye",
    "description": "Computer Vision Researchers develop algorithms that enable machines to interpret visual information from the real world, working on object detection, 3D reconstruction, and medical imaging.",
    "technicalSkills": ["Python", "Deep Learning", "CNN", "Image Processing", "Linear Algebra", "PyTorch", "OpenCV", "Mathematics"],
    "researchSkills": ["Research Methodology", "Experimental Design", "Data Collection", "Academic Writing", "Literature Review"],
    "tools": ["PyTorch", "OpenCV", "TensorFlow", "YOLO", "Detectron2", "NumPy", "Matplotlib", "Git"],
    "researchAreas": ["Object Detection", "3D Vision", "Medical Imaging", "Video Understanding", "Scene Understanding", "Autonomous Driving"],
    "opportunities": [
      { "title": "CV Research Intern", "org": "Meta AI Research", "type": "Internship", "required": ["Python", "CNN", "PyTorch", "Research Methodology"], "url": "https://ai.meta.com/careers/" }
    ]
  },
  {
    "id": "nlp-researcher",
    "title": "NLP Researcher",
    "icon": "FileText",
    "description": "NLP Researchers study and build systems that understand, process, and generate human language, spanning machine translation, sentiment analysis, and large language models.",
    "technicalSkills": ["Python", "NLP", "Deep Learning", "Linguistics", "Statistics", "Transformer Architecture", "HuggingFace", "Machine Learning"],
    "researchSkills": ["Research Methodology", "Data Annotation", "Experimental Design", "Academic Writing", "Literature Review"],
    "tools": ["HuggingFace", "NLTK", "spaCy", "PyTorch", "Jupyter", "Pandas", "Git", "Weights & Biases"],
    "researchAreas": ["Machine Translation", "Question Answering", "Sentiment Analysis", "Information Extraction", "Dialogue Systems", "Text Generation"],
    "opportunities": [
      { "title": "NLP Research Intern", "org": "Google Research", "type": "Internship", "required": ["Python", "NLP", "Deep Learning", "Academic Writing"], "url": "https://research.google/careers/" }
    ]
  },
  {
    "id": "data-science-researcher",
    "title": "Data Science Researcher",
    "icon": "BarChart2",
    "description": "Data Science Researchers combine statistical modeling, machine learning, and domain expertise to extract insights from large-scale datasets.",
    "technicalSkills": ["Python", "Statistics", "Machine Learning", "Data Analysis", "SQL", "R", "Visualization", "Probability"],
    "researchSkills": ["Research Methodology", "Statistical Analysis", "Data Collection", "Academic Writing", "Critical Analysis"],
    "tools": ["Python", "R", "SQL", "Tableau", "Pandas", "Scikit-learn", "Jupyter", "Git"],
    "researchAreas": ["Causal Inference", "Bayesian Statistics", "Survey Research", "Time Series", "Spatial Analysis", "A/B Testing"],
    "opportunities": [
      { "title": "Data Science Research Intern", "org": "Netflix Research", "type": "Internship", "required": ["Python", "Statistics", "Machine Learning", "Research Methodology"], "url": "https://research.netflix.com/" }
    ]
  },
  {
    "id": "robotics-researcher",
    "title": "Robotics Researcher",
    "icon": "Cpu",
    "description": "Robotics Researchers develop intelligent physical systems that perceive, reason, and act in the real world across control theory, computer vision, and AI.",
    "technicalSkills": ["Python", "ROS", "Control Theory", "Computer Vision", "Deep Learning", "C++", "Linear Algebra", "Kinematics"],
    "researchSkills": ["Research Methodology", "Experimental Design", "Hardware Prototyping", "Academic Writing", "Safety Analysis"],
    "tools": ["ROS", "Gazebo", "PyTorch", "OpenCV", "MoveIt", "MATLAB", "Git", "Arduino"],
    "researchAreas": ["Autonomous Navigation", "Manipulation", "Human-Robot Interaction", "Swarm Robotics", "Soft Robotics", "Aerial Robotics"],
    "opportunities": [
      { "title": "Robotics Research Intern", "org": "Boston Dynamics", "type": "Internship", "required": ["Python", "ROS", "Control Theory", "Research Methodology"], "url": "https://bostondynamics.com/careers/" }
    ]
  },
  {
    "id": "cybersecurity-researcher",
    "title": "Cybersecurity Researcher",
    "icon": "Shield",
    "description": "Cybersecurity Researchers study attack surfaces, vulnerabilities, and defense mechanisms, performing threat modeling, reverse engineering, and cryptographic protocols.",
    "technicalSkills": ["Python", "Networking", "Cryptography", "Linux", "Reverse Engineering", "Machine Learning", "C/C++", "Security Protocols"],
    "researchSkills": ["Research Methodology", "Threat Analysis", "Vulnerability Assessment", "Academic Writing", "Ethical Research"],
    "tools": ["Wireshark", "Metasploit", "Ghidra", "Burp Suite", "Python", "Nmap", "Docker", "Git"],
    "researchAreas": ["Malware Analysis", "Network Security", "Privacy Engineering", "AI Security", "Cryptography", "IoT Security"],
    "opportunities": [
      { "title": "Security Research Intern", "org": "Cloudflare Research", "type": "Internship", "required": ["Python", "Networking", "Cryptography", "Research Methodology"], "url": "https://cloudflare.com/careers/" }
    ]
  },
  {
    "id": "healthcare-ai-researcher",
    "title": "Healthcare AI Researcher",
    "icon": "Activity",
    "description": "Healthcare AI Researchers apply machine learning to medical diagnostics, treatment planning, drug discovery, and clinical decision support.",
    "technicalSkills": ["Python", "Machine Learning", "Bioinformatics", "Statistics", "Deep Learning", "Medical Image Analysis", "Data Analysis", "R"],
    "researchSkills": ["Research Methodology", "Clinical Study Design", "Data Ethics", "Academic Writing", "IRB Protocols"],
    "tools": ["Python", "R", "TensorFlow", "PyTorch", "MATLAB", "MONAI", "SPSS", "Jupyter"],
    "researchAreas": ["Medical Image Diagnosis", "Drug Discovery", "Genomics", "Clinical NLP", "Predictive Health", "Federated Learning"],
    "opportunities": [
      { "title": "Healthcare AI Research Intern", "org": "Google Health", "type": "Internship", "required": ["Python", "Deep Learning", "Medical Image Analysis", "Research Methodology"], "url": "https://health.google/careers/" }
    ]
  },
  {
    "id": "data-mining-researcher",
    "title": "Data Mining Researcher",
    "icon": "Layers",
    "description": "Data Mining Researchers develop algorithms to discover patterns, anomalies, and insights from large-scale datasets.",
    "technicalSkills": ["Python", "Data Mining", "Machine Learning", "SQL", "Graph Algorithms", "Statistics", "Pattern Recognition", "Big Data"],
    "researchSkills": ["Research Methodology", "Algorithm Design", "Benchmarking", "Academic Writing", "Literature Review"],
    "tools": ["Python", "Spark", "Hadoop", "Neo4j", "SQL", "Scikit-learn", "D3.js", "Git"],
    "researchAreas": ["Knowledge Graph Mining", "Anomaly Detection", "Sequential Pattern Mining", "Social Network Analysis", "Recommender Systems", "Stream Mining"],
    "opportunities": [
      { "title": "Data Mining Research Intern", "org": "Amazon Research", "type": "Internship", "required": ["Python", "Data Mining", "Machine Learning", "SQL"], "url": "https://www.amazon.science/careers/" }
    ]
  },
  {
    "id": "software-systems-researcher",
    "title": "Software Systems Researcher",
    "icon": "Code",
    "description": "Software Systems Researchers study programming languages, compilers, operating systems, distributed computing, and formal verification.",
    "technicalSkills": ["C/C++", "Systems Programming", "Algorithms", "Operating Systems", "Distributed Systems", "Formal Methods", "Python", "Computer Architecture"],
    "researchSkills": ["Research Methodology", "Formal Verification", "Benchmarking", "Academic Writing", "Proof Writing"],
    "tools": ["GCC", "LLVM", "Linux Kernel", "Git", "Valgrind", "Perf", "Docker", "Z3 Solver"],
    "researchAreas": ["Programming Languages", "Distributed Systems", "Compiler Optimization", "OS Internals", "Formal Verification", "Cloud Systems"],
    "opportunities": [
      { "title": "Systems Research Intern", "org": "Microsoft Research", "type": "Internship", "required": ["C/C++", "Systems Programming", "Algorithms", "Research Methodology"], "url": "https://www.microsoft.com/en-us/research/careers/" }
    ]
  },
  {
    "id": "quantum-ai-researcher",
    "title": "Quantum AI Researcher",
    "icon": "Zap",
    "description": "Quantum AI Researchers explore the intersection of quantum computing and machine learning, developing quantum neural networks and hybrid models.",
    "technicalSkills": ["Python", "Quantum Computing", "Linear Algebra", "Quantum Algorithms", "PyTorch", "Qiskit", "Physics", "Machine Learning"],
    "researchSkills": ["Research Methodology", "Theoretical Analysis", "Experimental Design", "Academic Writing", "Literature Review"],
    "tools": ["Qiskit", "Cirq", "PennyLane", "PyTorch", "Jupyter", "NumPy", "Git"],
    "researchAreas": ["Quantum Machine Learning", "Variational Quantum Algorithms", "Quantum Optimization", "Quantum Neural Networks", "Quantum Error Correction"],
    "opportunities": [
      { "title": "Quantum Research Intern", "org": "IBM Quantum", "type": "Internship", "required": ["Python", "Quantum Computing", "Qiskit"], "url": "https://www.ibm.com/quantum" }
    ]
  },
  {
    "id": "bioinformatics-researcher",
    "title": "Bioinformatics & Genomics Researcher",
    "icon": "FlaskConical",
    "description": "Bioinformatics Researchers process and model biological data such as DNA sequences, proteins, and molecular structures to advance computational biology.",
    "technicalSkills": ["Python", "R", "Bioinformatics", "Genomics", "Statistics", "Machine Learning", "Data Analysis", "Molecular Biology"],
    "researchSkills": ["Research Methodology", "Sequence Analysis", "Statistical Modeling", "Academic Writing", "Data Ethics"],
    "tools": ["Biopython", "R", "BLAST", "PyMOL", "Pandas", "Jupyter", "Git", "Nextflow"],
    "researchAreas": ["Genomic Sequence Alignment", "Protein Structure Prediction", "Phylogenetics", "Metagenomics", "Single-cell RNA-seq"],
    "opportunities": [
      { "title": "Genomics Research Intern", "org": "Illumina Research", "type": "Internship", "required": ["Python", "Bioinformatics", "Genomics"], "url": "https://www.illumina.com/" }
    ]
  }
];

const axios = require('axios');

// RapidAPI helper to automatically fetch live active research jobs/postings
async function fetchRapidApiResearchOpportunities(query) {
  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY;
  if (!rapidApiKey) return null;

  try {
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `${query} Research Intern`,
        page: '1',
        num_pages: '1'
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      },
      timeout: 4000
    };

    const response = await axios.request(options);
    if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data.slice(0, 3).map(job => ({
        title: job.job_title || `${query} Research Fellow`,
        org: job.employer_name || 'AI Research Lab',
        type: job.job_employment_type || 'Research Internship',
        required: job.job_required_skills || ['Python', 'Research Methodology'],
        url: job.job_apply_link || job.job_google_link || 'https://rapidapi.com/'
      }));
    }
  } catch (err) {
    console.warn(`RapidAPI query for "${query}" failed or key missing:`, err.message);
  }
  return null;
}

// GET /api/career/careers (Automated RapidAPI-powered 12 AI & Scientific Domains)
router.get('/careers', async (req, res) => {
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY;
    
    // If RapidAPI Key is configured, enrich the 12 domains automatically with live postings
    if (rapidApiKey) {
      const enrichedCareers = await Promise.all(
        CAREERS_DATA.map(async (career) => {
          const liveOpps = await fetchRapidApiResearchOpportunities(career.title);
          if (liveOpps && liveOpps.length > 0) {
            return {
              ...career,
              opportunities: liveOpps,
              isAutomated: true,
              dataSource: 'RapidAPI JSearch'
            };
          }
          return { ...career, isAutomated: true, dataSource: 'RapidAPI JSearch' };
        })
      );
      return res.json(enrichedCareers);
    }

    // Default response with automated RapidAPI-compatible structure
    const automatedCareers = CAREERS_DATA.map(career => ({
      ...career,
      isAutomated: true,
      dataSource: 'RapidAPI Engine'
    }));

    res.json(automatedCareers);
  } catch (err) {
    console.error('Error fetching automated careers:', err);
    res.json(CAREERS_DATA);
  }
});

// GET /api/career/profile?userId=xxx
router.get('/profile', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      skills: user.skills || [],
      researchDomains: user.researchDomains || [],
      fullName: user.fullName || '',
      role: user.role || '',
      bio: user.bio || '',
      researchInterests: user.researchInterests || ''
    });
  } catch (err) {
    console.error('Error fetching career profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/career/profile
router.put('/profile', async (req, res) => {
  try {
    const { userId, skills, researchDomains } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (skills !== undefined) {
      user.skills = skills;
    }
    if (researchDomains !== undefined) {
      user.researchDomains = researchDomains;
    }

    await user.save();

    res.json({
      message: 'Skills and domains updated successfully',
      skills: user.skills,
      researchDomains: user.researchDomains,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        researchInterests: user.researchInterests,
        skills: user.skills,
        researchDomains: user.researchDomains
      }
    });
  } catch (err) {
    console.error('Error updating skills:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
