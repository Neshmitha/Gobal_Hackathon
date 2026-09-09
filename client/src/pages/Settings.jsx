import AppSidebar from '../components/AppSidebar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Search, FileText, Upload, Settings as SettingsIcon, LogOut,
    User, Mail, Building, Target, Fingerprint, Camera, Sparkles,
    Zap, Brain, Database, Sliders, CheckSquare, List, Quote,
    Share2, Download, Trash2, ShieldAlert, ChevronRight, BookOpen, Star, Bot,
    Edit3, Shield, Key, Compass, Menu, Sun, Moon, GitPullRequest, ChevronDown,
    Plus, X, Check, Award, Globe
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';

const PREDEFINED_RESEARCH_DOMAINS = [
    'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Natural Language Processing',
    'Computer Vision', 'Robotics', 'Cybersecurity', 'Data Science', 'Bioinformatics',
    'Healthcare AI', 'Generative AI', 'Reinforcement Learning', 'Graph Neural Networks',
    'Cloud Computing', 'Distributed Systems', 'Software Engineering',
    'Human-Computer Interaction', 'Quantum Computing', 'Edge AI', 'Explainable AI'
];

const LEVEL_COLORS = {
    Beginner: '#38bdf8',
    Intermediate: '#38bdf8',
    Advanced: '#38bdf8'
};

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : {
            username: 'Guest',
            email: 'guest@example.edu',
            fullName: '',
            role: '',
            bio: '',
            researchInterests: '',
            skills: [],
            researchDomains: []
        };
    });

    // Profile Fields State
    const [profileData, setProfileData] = useState({
        fullName: user.fullName || '',
        role: user.role || '',
        bio: user.bio || '',
        researchInterests: user.researchInterests || ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

    // Skills & Research Domains State
    const [skills, setSkills] = useState(() => {
        if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
            return user.skills;
        }
        return [
            { name: 'Python', level: 'Intermediate' },
            { name: 'Machine Learning', level: 'Beginner' }
        ];
    });

    const [researchDomains, setResearchDomains] = useState(() => {
        if (user.researchDomains && Array.isArray(user.researchDomains) && user.researchDomains.length > 0) {
            return user.researchDomains;
        }
        return ['Artificial Intelligence', 'Data Science'];
    });

    // New Skill Form State
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const isDark = theme === 'dark';

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Fetch fresh profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            const userId = user.id || user._id;
            if (userId) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/auth/profile/${userId}`);
                    if (res.data && res.data.user) {
                        const fetched = res.data.user;
                        setUser(fetched);
                        localStorage.setItem('user', JSON.stringify(fetched));
                        setProfileData({
                            fullName: fetched.fullName || '',
                            role: fetched.role || '',
                            bio: fetched.bio || '',
                            researchInterests: fetched.researchInterests || ''
                        });
                        if (fetched.skills) setSkills(fetched.skills);
                        if (fetched.researchDomains) setResearchDomains(fetched.researchDomains);
                    }
                } catch (err) {
                    console.warn('Could not load fresh profile from backend:', err.message);
                }
            }
        };
        fetchProfile();
    }, []);

    // Listen for theme & skill updates
    useEffect(() => {
        const handleThemeChange = (e) => setTheme(e.detail);
        window.addEventListener('themeChange', handleThemeChange);

        const handleSkillUpdate = (e) => {
            if (e.detail && Array.isArray(e.detail)) {
                setSkills(e.detail);
            }
        };
        window.addEventListener('userSkillsUpdated', handleSkillUpdate);

        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
            window.removeEventListener('userSkillsUpdated', handleSkillUpdate);
        };
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
        window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        setPasswordLoading(true);
        try {
            const userId = user.id || user._id;
            const res = await axios.post(`${API_BASE_URL}/auth/update-password`, {
                userId,
                currentPassword,
                newPassword
            });

            alert(res.data.message);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    // Skill Form Actions
    const handleAddSkill = (e) => {
        if (e) e.preventDefault();
        if (!newSkillName.trim()) return;

        const trimmed = newSkillName.trim();
        const existingIndex = skills.findIndex(s => s.name.toLowerCase() === trimmed.toLowerCase());
        let updated;
        if (existingIndex >= 0) {
            updated = [...skills];
            updated[existingIndex] = { name: trimmed, level: newSkillLevel };
        } else {
            updated = [...skills, { name: trimmed, level: newSkillLevel }];
        }

        setSkills(updated);
        setNewSkillName('');

        // Notify app components
        window.dispatchEvent(new CustomEvent('userSkillsUpdated', { detail: updated }));
    };

    const handleRemoveSkill = (skillNameToRemove) => {
        const updated = skills.filter(s => s.name.toLowerCase() !== skillNameToRemove.toLowerCase());
        setSkills(updated);

        // Notify app components
        window.dispatchEvent(new CustomEvent('userSkillsUpdated', { detail: updated }));
    };

    // Research Domain Actions
    const handleToggleDomain = (domain) => {
        let updated;
        if (researchDomains.includes(domain)) {
            updated = researchDomains.filter(d => d !== domain);
        } else {
            updated = [...researchDomains, domain];
        }
        setResearchDomains(updated);
    };

    // Full Save Profile Action
    const handleUpdateProfile = async () => {
        setProfileLoading(true);
        setSaveSuccessMsg('');
        try {
            const userId = user.id || user._id;
            const payload = {
                userId,
                ...profileData,
                skills,
                researchDomains
            };

            const res = await axios.post(`${API_BASE_URL}/auth/update-profile`, payload);
            const updatedUser = res.data.user || { ...user, ...payload };

            // Also sync to career profile endpoint
            try {
                await axios.put(`${API_BASE_URL}/career/profile`, { userId, skills, researchDomains });
            } catch (careerErr) {
                console.warn('Career endpoint sync notice:', careerErr.message);
            }

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('userSkillsUpdated', { detail: skills }));

            setSaveSuccessMsg('Profile & Research Preferences Saved Successfully!');
            setTimeout(() => setSaveSuccessMsg(''), 4000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("CRITICAL ACTION: Are you absolutely sure you want to PERMANENTLY delete your account? This will erase all your papers, drafts, and research data. This cannot be undone.")) {
            return;
        }

        try {
            const userId = user.id || user._id;
            if (!userId) {
                alert("Error: User ID not found. Please log out and log in again.");
                return;
            }

            await axios.delete(`${API_BASE_URL}/auth/${userId}`);
            alert('Your account has been permanently deleted.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/register');
        } catch (err) {
            console.error("Delete account error details:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete account';
            alert(`Error deleting account: ${errorMsg}`);
        }
    };

    return (
        <div className={`flex h-screen font-sans overflow-hidden transition-all ${isDark ? 'bg-[#000000] text-white' : 'bg-[#ffffff] text-black'}`}>
            {/* Sidebar */}
            <AppSidebar
                isOpen={isSidebarOpen}
                activePage="settings"
                isDark={isDark}
                onClose={() => setIsSidebarOpen(false)}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex-1 overflow-y-auto px-8 py-10 scrollbar-hide z-10">
                    <div className="max-w-3xl mx-auto">
                        <header className="mb-12 flex items-center justify-between">
                            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                                Settings & Profile
                            </h2>

                            {saveSuccessMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg"
                                >
                                    <Check size={16} />
                                    <span>{saveSuccessMsg}</span>
                                </motion.div>
                            )}
                        </header>

                        <div className="space-y-12 pb-24">
                            {/* Section 1: Profile & Identity */}
                            <section>
                                <div className={`flex items-center gap-2 mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <User size={16} />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Profile & Identity</h2>
                                </div>

                                <div className={`rounded-[32px] p-8 backdrop-blur-md ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-xl shadow-blue-900/5'}`}>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="relative group">
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl ${isDark ? 'bg-black border border-[#38bdf8]/30 text-[#38bdf8] shadow-[#38bdf8]/20' : 'bg-white text-black border-2 border-[#38bdf8]/20 shadow-[#38bdf8]/40'} `}>
                                                {user.username ? user.username[0].toUpperCase() : 'U'}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{user.username}</h3>
                                            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'}`}>{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Username (Display)" value={user.username} isDark={isDark} readOnly />
                                        <InputField label="Email Address" value={user.email} isDark={isDark} readOnly />

                                        <InputField
                                            label="Full Name"
                                            value={profileData.fullName}
                                            onChange={(val) => handleProfileChange('fullName', val)}
                                            placeholder="Your full name"
                                            isDark={isDark}
                                        />

                                        <div className="space-y-2">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
                                            <div className="relative">
                                                <select
                                                    value={profileData.role}
                                                    onChange={(e) => handleProfileChange('role', e.target.value)}
                                                    className={`w-full rounded-2xl py-4 px-5 text-sm font-bold outline-none appearance-none transition-all shadow-inner ${isDark ? 'bg-black/50 border border-white/5 text-white focus:border-[#38bdf8] focus:bg-black placeholder:text-gray-700' : 'bg-white border text-black border-gray-200 focus:border-[#38bdf8] focus:shadow-[0_0_15px_rgba(56,189,248,0.2)]'}`}
                                                >
                                                    <option value="" disabled>Select your role</option>
                                                    <option value="Student">Student</option>
                                                    <option value="Researcher">Researcher</option>
                                                    <option value="Professor">Professor</option>
                                                    <option value="Industry">Industry</option>
                                                </select>
                                                <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-[#38bdf8]'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-6">
                                        <div className="space-y-2">
                                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Short Bio</label>
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => handleProfileChange('bio', e.target.value)}
                                                placeholder="A brief introduction about yourself..."
                                                rows="3"
                                                className={`w-full rounded-2xl py-4 px-5 text-sm font-bold outline-none resize-none transition-all shadow-inner ${isDark ? 'bg-black/50 border border-white/5 text-white focus:border-[#38bdf8] focus:bg-black placeholder:text-gray-700' : 'bg-white border text-black border-gray-200 focus:border-[#38bdf8] focus:shadow-[0_0_15px_rgba(56,189,248,0.2)]'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Skills & Research Domains */}
                            <section>
                                <div className={`flex items-center gap-2 mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Brain size={16} className="text-[#38bdf8]" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Skills & Research Domains</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* 2A. Research Skills Card */}
                                    <div className={`rounded-[32px] p-8 backdrop-blur-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border border-gray-200 shadow-xl shadow-blue-900/5'}`}>
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'} flex items-center gap-2`}>
                                                    <Award size={18} className="text-[#38bdf8]" />
                                                    Research Skills
                                                </h3>
                                                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-cyan-500/10 text-[#38bdf8] border border-cyan-500/20">
                                                    {skills.length} Skills Added
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Add your technical & research skills along with your proficiency level. Syncs instantly across Career module algorithms.
                                            </p>
                                        </div>

                                        {/* Input Form Bar */}
                                        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <input
                                                type="text"
                                                placeholder="e.g. Python, Deep Learning, Statistics…"
                                                value={newSkillName}
                                                onChange={(e) => setNewSkillName(e.target.value)}
                                                className={`flex-1 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none border transition-all ${
                                                    isDark
                                                        ? 'bg-black/50 border-white/10 text-white focus:border-[#38bdf8] focus:bg-black placeholder:text-gray-600'
                                                        : 'bg-white border-gray-200 text-black focus:border-[#38bdf8] placeholder:text-gray-400'
                                                }`}
                                            />

                                            <div className="relative">
                                                <select
                                                    value={newSkillLevel}
                                                    onChange={(e) => setNewSkillLevel(e.target.value)}
                                                    className={`w-full sm:w-40 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none appearance-none border transition-all cursor-pointer ${
                                                        isDark
                                                            ? 'bg-black/50 border-white/10 text-white focus:border-[#38bdf8]'
                                                            : 'bg-white border-gray-200 text-black focus:border-[#38bdf8]'
                                                    }`}
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </select>
                                                <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-[#38bdf8]'}`} />
                                            </div>

                                            <button
                                                type="submit"
                                                className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 ${
                                                    isDark
                                                        ? 'bg-[#38bdf8] text-black hover:bg-cyan-300 shadow-[#38bdf8]/20'
                                                        : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
                                                }`}
                                            >
                                                <Plus size={18} />
                                                <span>Add</span>
                                            </button>
                                        </form>

                                        {/* Skills Pill List */}
                                        <div>
                                            {skills.length === 0 ? (
                                                <div className={`p-6 rounded-2xl border-2 border-dashed text-center ${isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                                                    <p className="text-xs font-semibold">No skills added yet. Type above and press Enter or click Add.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2.5">
                                                    {skills.map((skill, idx) => {
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all ${
                                                                    isDark
                                                                        ? 'bg-black/60 border-white/10 text-white hover:border-[#38bdf8]/50'
                                                                        : 'bg-white border-gray-200 text-slate-900 hover:border-[#0284c7] shadow-xs'
                                                                }`}
                                                            >
                                                                <span className="text-xs font-bold">{skill.name}</span>
                                                                <span
                                                                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${
                                                                        isDark
                                                                            ? 'bg-cyan-500/15 text-[#38bdf8] border-cyan-500/30'
                                                                            : 'bg-cyan-50 text-[#0284c7] border-cyan-200'
                                                                    }`}
                                                                >
                                                                    {skill.level}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSkill(skill.name)}
                                                                    className={`p-0.5 rounded-lg transition-colors ml-1 ${
                                                                        isDark ? 'text-gray-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'
                                                                    }`}
                                                                    title="Remove Skill"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2B. Research Domains Card */}
                                    <div className={`rounded-[32px] p-8 backdrop-blur-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border border-gray-200 shadow-xl shadow-blue-900/5'}`}>
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'} flex items-center gap-2`}>
                                                    <Globe size={18} className="text-[#38bdf8]" />
                                                    Research Domains
                                                </h3>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                                                    isDark
                                                        ? 'bg-cyan-500/10 text-[#38bdf8] border-cyan-500/20'
                                                        : 'bg-cyan-50 text-[#0284c7] border-cyan-200'
                                                }`}>
                                                    {researchDomains.length} Selected
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Select your primary fields of scientific interest and specialized AI subdomains.
                                            </p>
                                        </div>

                                        {/* Domain Toggle Chips Grid */}
                                        <div className="flex flex-wrap gap-2.5">
                                            {PREDEFINED_RESEARCH_DOMAINS.map((domain, idx) => {
                                                const selected = researchDomains.includes(domain);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={idx}
                                                        onClick={() => handleToggleDomain(domain)}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                                                            selected
                                                                ? 'bg-[#38bdf8] text-black border-[#38bdf8] shadow-lg shadow-[#38bdf8]/20 font-black'
                                                                : isDark
                                                                ? 'bg-black/40 border-white/10 text-gray-300 hover:border-white/25 hover:text-white'
                                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:text-black'
                                                        }`}
                                                    >
                                                        {selected && <Check size={14} className="stroke-[3]" />}
                                                        <span>{domain}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Appearance */}
                            <section>
                                <div className={`flex items-center gap-2 mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Sparkles size={16} />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Appearance</h2>
                                </div>

                                <div className={`rounded-[32px] p-8 backdrop-blur-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border border-gray-200 shadow-xl shadow-blue-900/5'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>Application Theme</h3>
                                            <p className={`text-sm mt-1 font-medium max-w-[250px] md:max-w-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Switch between the Bright and Dark visual layers globally.</p>
                                        </div>

                                        <button
                                            onClick={toggleTheme}
                                            className={`relative flex items-center justify-between w-24 h-12 rounded-full cursor-pointer transition-colors duration-300 p-1 flex-shrink-0 ${isDark ? 'bg-[#121212] border-2 border-white/10' : 'bg-blue-50 border border-blue-200 shadow-inner'}`}
                                        >
                                            <Sun size={18} className={`ml-2 z-10 transition-colors ${!isDark ? 'text-amber-500' : 'text-gray-600'}`} />
                                            <Moon size={18} className={`mr-2 z-10 transition-colors ${isDark ? 'text-white' : 'text-gray-400'}`} />

                                            <motion.div
                                                className={`absolute w-10 h-10 rounded-full shadow-lg ${isDark ? 'bg-[#38bdf8]' : 'bg-white border border-gray-100'}`}
                                                animate={{
                                                    x: isDark ? 46 : 0
                                                }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Save Actions */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={profileLoading}
                                    className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                                        isDark
                                            ? 'bg-[#38bdf8] text-black shadow-[#38bdf8]/20 hover:shadow-[#38bdf8]/40 hover:bg-cyan-300'
                                            : 'bg-black text-white shadow-black/20 hover:shadow-black/40'
                                    }`}
                                >
                                    {profileLoading ? 'Saving Changes...' : 'Save Profile'}
                                </button>
                            </div>

                            {/* Section 5: Security & Password */}
                            <section>
                                <div className={`flex items-center gap-2 mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Key size={16} />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Authentication Details</h2>
                                </div>

                                <div className={`rounded-[32px] p-8 backdrop-blur-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border border-gray-200 shadow-xl shadow-blue-900/5'}`}>
                                    <div>
                                        <h3 className={`text-xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Change Password</h3>
                                        <p className={`text-sm font-medium mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ensure your account is using a long, random password to stay secure.</p>

                                        <div className="grid grid-cols-1 gap-6">
                                            <InputField label="Current Password" type="password" placeholder="••••••••" isDark={isDark} value={currentPassword} onChange={setCurrentPassword} />
                                            <InputField label="New Password" type="password" placeholder="••••••••" isDark={isDark} value={newPassword} onChange={setNewPassword} />
                                            <InputField label="Confirm New Password" type="password" placeholder="••••••••" isDark={isDark} value={confirmPassword} onChange={setConfirmPassword} />
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={handleUpdatePassword}
                                                disabled={passwordLoading}
                                                className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 border ${isDark ? 'bg-black text-white border-white/20 shadow-black/50 hover:bg-white/5 hover:text-[#38bdf8]' : 'bg-white text-black border-gray-200 shadow-gray-200/50 hover:bg-gray-50 hover:text-[#0284c7]'}`}>
                                                {passwordLoading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6: Danger Zone */}
                            <section>
                                <div className={`flex items-center gap-2 mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <ShieldAlert size={16} />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Danger Zone</h2>
                                </div>

                                <div className={`rounded-[32px] p-8 border ${isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-200'} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                                    <div>
                                        <h3 className="text-xl font-black text-red-500 flex items-center gap-2">
                                            Delete Account
                                        </h3>
                                        <p className={`text-sm mt-2 font-medium leading-relaxed ${isDark ? 'text-red-400/70 max-w-lg' : 'text-red-600/70 max-w-lg'}`}>
                                            Permanently delete your account, saved papers, and all drafted documents. This action is instantaneous and cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <button
                                            onClick={handleLogout}
                                            className={`whitespace-nowrap px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/15' : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-200'}`}>
                                            Sign Out
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className={`whitespace-nowrap px-8 py-4 rounded-2xl text-sm font-black transition-all border shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 ${isDark ? 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-red-500/20 shadow-red-500/10' : 'bg-red-100/50 text-red-600 hover:bg-red-500 hover:text-white border-red-300 shadow-red-200/50'}`}>
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <footer className="mt-20 text-center opacity-20">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] pb-12">Clarion Research Environment</p>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
};

const InputField = ({ label, value, type = "text", placeholder, isDark, onChange, readOnly }) => (
    <div className="space-y-2">
        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
        <div className="relative">
            <input
                type={type}
                {...(onChange ? { value, onChange: e => onChange(e.target.value) } : { defaultValue: value })}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full rounded-2xl py-4 px-5 text-sm font-bold outline-none transition-all shadow-inner ${readOnly ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-black/50 border border-white/5 text-white focus:border-[#38bdf8] focus:bg-black placeholder:text-gray-700' : 'bg-white border text-black border-gray-200 focus:border-[#38bdf8] placeholder:text-gray-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.2)]'}`}
            />
        </div>
    </div>
);

export default Settings;
