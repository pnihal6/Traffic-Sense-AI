import React from 'react';
import Card from '../components/Card';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
    const teamMembers = [
        { 
            name: 'Priyadarshi Nihal', 
            role: 'Lead AI/ML Engineer & Full Stack Developer', 
            regNo: '22BCE10665',
            isLead: true,
            contribution: 'Backend Development, Model Architecture Design, Model Development, Research Paper Writing, Integration & Deployment',
            achievements: [
                'Backend Development',
                'Model Development & Architecture Design',
                'Research Paper Writing',
                'Integration & Deployment'
            ]
        },
        { 
            name: 'Dev Tailor', 
            role: 'Full Stack Developer', 
            regNo: '22BCE11250',
            isLead: false,
            contribution: 'Frontend Components, UI/UX Design',
            achievements: ['Frontend Components', 'UI/UX Design']
        },
        { 
            name: 'Pratyush Dubey', 
            role: 'AI/ML Engineer & Backend Developer', 
            regNo: '22BCE10582',
            isLead: false,
            contribution: 'Model Training, Data Preprocessing, Backend Support',
            achievements: ['Model Training', 'Data Preprocessing', 'Backend Support']
        },
        { 
            name: 'Dattatrey', 
            role: 'Backend Developer', 
            regNo: '22BCE11036',
            isLead: false,
            contribution: 'API Development, Database Setup',
            achievements: ['API Development', 'Database Setup']
        },
        { 
            name: 'Shivalik Mathur', 
            role: 'Frontend Developer', 
            regNo: '22BCE11223',
            isLead: false,
            contribution: 'Frontend UI, Documentation',
            achievements: ['Frontend UI', 'Documentation']
        },
    ];

    const techStack = [
        // ⚙️ Core AI & ML
        'PyTorch',
        'Ultralytics YOLOv8',
        'YOLO-FDE (Feature Dynamic Enhanced)',
        'YOLO-DFA (Dynamic Feature Aggregation) ✨',
        'Supervision',
        'OpenCV',
        'NumPy',
        'Matplotlib',

        // 🧠 Backend
        'Flask',
        'Flask-CORS',
        'Werkzeug',
        'SQLite',
        'SQLAlchemy',
        'yt-dlp',
        'threading',
        'os / pathlib',

        // 🌐 Frontend
        'React',
        'TypeScript',
        'Vite',
        'TailwindCSS',
        'Framer Motion',
        'Recharts',
        'React Router',
        'Lucide Icons',

        // ⚡ System Integration
        'Fetch API',
        'FormData API',
        'LocalStorage API',
        'concurrently',
        'Node.js',
        'npm'
    ];

    const milestones = [
        { date: 'Sep 2025', event: '📊 Dataset Preparation & Base Model (YOLOv8) Training', completed: true },
        { date: 'Oct 2025', event: '🔬 Enhanced Models (YOLOv8-FDD, FDIDH+DWR, FDIDH+DySample) Trained & Tested', completed: true },
        { date: 'Nov 2025', event: '✅ YOLOv8-FDE Model Completed & Backend+Frontend Development', completed: true },
        { date: 'Dec 2025', event: '🚀 YOLO-DFA: New State-of-the-Art Model Architecture Design Started', completed: true },
        { date: 'Jan 2026', event: '🏆 YOLO-DFA Model Development & Training Completed (2.57M params, 93.32% mAP@50)', completed: true, isStar: true },
        { date: 'Feb 2026', event: '📝 Research Paper Submission to ICRATM 2026', completed: true },
        { date: 'Mar 2026', event: '⏳ Paper Under Review', completed: true },
        { date: 'Apr 2026', event: '✅ Paper ACCEPTED & PRESENTED at ICRATM 2026!', completed: true, isAccepted: true, isPresented: true },
        { date: 'Jun 2026', event: '📄 Journal Publication in Process (IEEE Access)', completed: false, isCurrent: true },
    ];

    return (
        <motion.div
            className="max-w-5xl mx-auto space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Page Title */}
            <motion.h1
                className="text-4xl font-bold text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                About Us
            </motion.h1>

            {/* Mission */}
            <Card>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong>Traffic Sense AI</strong> is built with a vision to enable efficient, accurate, and real-time traffic monitoring
                        for smarter roads and safer cities. Using state-of-the-art YOLO-based models including our latest{' '}
                        <strong className="text-amber-600 dark:text-amber-400">YOLO-DFA (Dynamic Feature Aggregation)</strong>, 
                        our system performs real-time vehicle detection, tracking, counting, and detailed analytics across multiple live or offline video streams.
                    </p>
                </motion.div>
            </Card>

            {/* Team - Lead Developer Highlighted */}
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-center">Meet the Capstone Team</h2>
                
                {/* Lead Developer Spotlight */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-400 dark:border-amber-600 shadow-xl"
                >
                    <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full mx-auto shadow-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                    {teamMembers[0].name.charAt(0)}
                                </span>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                ⭐ LEAD
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                {teamMembers[0].name}
                            </h3>
                            <p className="text-lg text-amber-600 dark:text-amber-500 font-semibold">{teamMembers[0].role}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{teamMembers[0].regNo}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                                Contribution: {teamMembers[0].contribution}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                {teamMembers[0].achievements.map(achievement => (
                                    <span key={achievement} className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                                        🏆 {achievement}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Other Team Members */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {teamMembers.slice(1).map(member => (
                        <motion.div
                            key={member.name}
                            className="text-center"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="w-20 h-20 rounded-full mx-auto mb-2 shadow-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                                    {member.name.charAt(0)}
                                </span>
                            </div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-xs text-primary-500 dark:text-primary-400">{member.role}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.regNo}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                Contribution: {member.contribution}
                            </p>
                        </motion.div>
                    ))}
                </div>
                
                {/* Lead Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong className="text-amber-600">Priyadarshi Nihal</strong> led the development as Lead AI/ML Engineer & Full Stack Developer.
                    </p>
                </div>
            </Card>

            {/* Supervisor Acknowledgment */}
            <Card>
                <h2 className="text-2xl font-bold mb-3">Acknowledgment</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We express our sincere gratitude to <strong>Dr. I. Jasmine Selvakumari Jeya, Assistant Dean, VIT Bhopal</strong>,
                    for her valuable guidance, encouragement, and academic support throughout this project.
                    Her direction in selecting the YOLO-FDD research foundation and mentoring us in enhancing
                    and structuring the model into our improved <strong>YOLO-FDE</strong> and ultimately the state-of-the-art{' '}
                    <strong className="text-amber-600">YOLO-DFA (Dynamic Feature Aggregation)</strong> architecture played a pivotal role
                    in shaping this work. We are truly grateful for her mentorship in research paper structuring,
                    model evaluation methodologies, and continuous motivation.
                </p>
            </Card>

            {/* Core Features */}
            <Card>
                <h2 className="text-2xl font-bold mb-3">Core Features of Traffic Sense AI</h2>
                <ul className="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Real-time multi-stream inference (up to 4 videos at once)</li>
                    <li>Accurate vehicle tracking with ByteTrack-based non-duplicate counting</li>
                    <li>Supports YouTube, live feeds, and local video inference</li>
                    <li>Detailed traffic analytics with total & class-wise vehicle stats</li>
                    <li>Interactive dashboard and YOLO model performance comparison</li>
                    <li>✨ <strong className="text-amber-600">YOLO-DFA</strong>: Latest state-of-the-art model with 93.32% mAP@50 and only 2.57M parameters</li>
                </ul>
            </Card>

            {/* Tech Stack & YOLO Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-2xl font-bold mb-3">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2">
                        {techStack.map(tech => (
                            <span
                                key={tech}
                                className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-medium px-2.5 py-0.5 rounded-full"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h2 className="text-2xl font-bold mb-3">What is YOLO-DFA?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                        <strong>YOLO-DFA (Dynamic Feature Aggregation)</strong> is our latest state-of-the-art YOLO variant designed specifically for
                        traffic surveillance. It builds upon YOLOv8-FDE with <strong>5 key innovations</strong>:
                    </p>
                    <ul className="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                        <li><strong>R-ELAN</strong>: Multi-branch feature aggregation with residual connections</li>
                        <li><strong>BiFPN</strong>: Learnable weighted multi-scale feature fusion</li>
                        <li><strong>C2PSA</strong>: Partial spatial attention for localization refinement</li>
                        <li><strong>SE Modules</strong>: Channel-wise attention for feature recalibration</li>
                        <li><strong>Area Attention</strong>: Region-based contextual modeling</li>
                    </ul>
                    <p className="text-gray-600 dark:text-gray-300 mt-3 text-sm">
                        Achieving <strong>93.32% mAP@50</strong> and <strong>83.02% mAP@50-95</strong> with only <strong>2.57M parameters</strong>.
                    </p>
                </Card>
            </div>

            {/* Roadmap */}
            <Card>
                <h2 className="text-2xl font-bold mb-3">📅 Project Roadmap & Timeline</h2>
                <div className="space-y-3">
                    {milestones.map((item, idx) => (
                        <motion.div
                            key={item.event}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center p-3 rounded-lg ${
                                item.isStar 
                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500'
                                    : item.isAccepted
                                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                                    : item.isCurrent
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            <span className="font-semibold text-primary-500 w-32 text-sm">{item.date}</span>
                            <span className="text-gray-700 dark:text-gray-300 flex-1">
                                {item.event}
                            </span>
                            {item.completed && (
                                <span className="text-green-500 text-xs ml-2">✓</span>
                            )}
                            {item.isStar && (
                                <span className="text-amber-500 text-xs ml-2">🏆</span>
                            )}
                            {item.isAccepted && (
                                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">ACCEPTED & PRESENTED</span>
                            )}
                            {item.isCurrent && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 animate-pulse">IN PROGRESS</span>
                            )}
                        </motion.div>
                    ))}
                </div>
                
                {/* Timeline Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span>Key Milestone (YOLO-DFA)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>In Progress</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Research Publications - Updated with April 2026 acceptance & presentation */}
            <Card>
                <h2 className="text-2xl font-bold mb-3">📄 Research Publications</h2>
                <div className="space-y-3">
                    {/* YOLOv8-FDE Paper */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold">YOLOv8-FDE: Real-Time Vehicle Detection Method</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Internal Technical Report, 2025</p>
                        <p className="text-xs text-gray-500 mt-1">Baseline architecture with FDIDH, DySample, and DWR modules</p>
                        <p className="text-xs text-blue-600 mt-1">📅 Completed: November 2025</p>
                        <a
                            href="/papers/YOLO_FDE.pdf"
                            download
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
                        >
                            📄 Download PDF →
                        </a>
                    </div>

                    {/* YOLO-DFA Paper - ICRATM 2026 */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                        <p className="font-semibold text-amber-700 dark:text-amber-400">✨ YOLO-DFA: Dynamic Feature Aggregation for Real-Time Vehicle Detection</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Presented at ICRATM 2026 | VIT Bhopal University</p>
                        <p className="text-xs text-gray-500 mt-1">State-of-the-art with 2.57M parameters, 93.32% mAP@50, and 83.02% mAP@50-95</p>
                        <p className="text-xs text-green-600 mt-1">↑1.43% improvement over YOLOv8-FDE</p>
                        <p className="text-xs text-amber-600 mt-1">✍️ First Author: Priyadarshi Nihal</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Accepted & Presented: April 2026</span>
                        </div>
                        <div className="mt-3">
                            <a
                                href="/papers/YOLO_DFA_ICRATM_2026.pdf"
                                download
                                className="inline-flex items-center gap-1 text-sm bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
                            >
                                📄 Download Conference Paper (PDF)
                            </a>
                            <p className="text-xs text-gray-500 mt-2">
                                📝 Journal version under review for IEEE Access publication (Expected: Late 2026)
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* GitHub Link */}
            <Card>
                <div className="flex flex-col items-center space-y-3 text-center">
                    <a
                        href="https://github.com/pnihal6/Traffic-Sense-AI"
                        target="_blank"
                        className="font-medium text-primary-600 dark:text-primary-400 hover:underline text-lg"
                    >
                        🔗 GitHub Repository Link
                    </a>
                    <p className="text-xs text-gray-500">
                        Developed by <strong className="text-amber-600">Priyadarshi Nihal</strong> and Team | VIT Bhopal University
                    </p>
                </div>
            </Card>
        </motion.div>
    );
};

export default AboutPage;