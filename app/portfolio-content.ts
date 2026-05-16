export type ProfileContent = {
  name: string;
  headline: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumePath: string;
  summary: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  institution: string;
  summary: string;
  bullets: string[];
  fullImageUrl?: string;
  imagePosition?: string;
  imageUrl?: string;
  metrics?: string;
  repoUrl?: string;
  liveUrl?: string;
  tags?: string[];
};

export type ExperienceItem = {
  id: string;
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  details: string[];
  siteUrl?: string;
  logoUrl?: string;
};

export type ResearchItem = {
  id: string;
  title: string;
  summary: string;
  authors: string;
  institution: string;
  conference: string;
  venueShort?: string;
  conferenceDate: string;
  publicationDate: string;
  publicationUrl: string;
  doi: string;
  abstract: string;
  tags?: string[];
};

export type EducationItem = {
  id: string;
  title: string;
  summary: string;
  details: string[];
  meta?: string;
  tags?: string[];
};

export const profileContent: ProfileContent = {
  email: "taufiq.m.a.syed@gmail.com",
  githubUrl: "https://github.com/TaufiqSyed",
  headline: "full-stack engineer / research assistant / AI enthusiast",
  linkedinUrl: "https://www.linkedin.com/in/taufiq-syed/",
  location: "Dubai, UAE",
  name: "Taufiq Syed",
  resumePath: "/resume/Taufiq-Syed-CV-Jan-2026.pdf",
  summary: "AUS Computer Science graduate building applied AI and software systems.",
};

export const projects: ProjectItem[] = [
  {
    id: "music-structures",
    name: "Generation of High-Level Music Structures",
    institution: "American University of Sharjah - COE 476",
    summary: "MusicGen LoRA fine-tuning with structural prompt extraction.",
    bullets: [
      "Prepared music-prompt pairs from audio metadata and structural annotations.",
      "Finetuned the MusicGen transformer using a LoRA adaptor.",
    ],
    fullImageUrl: "/images/projects/source/music-structures.png",
    imageUrl: "/images/projects/music-structures.png",
    metrics: "CLAP LAION FAD: 0.9959; Overall Quality: 70.48/100",
    tags: ["musicgen", "lora", "ml"],
  },
  {
    id: "waste-classification",
    name: "Waste Classification with Feature Extraction",
    institution: "American University of Sharjah - CMP 466",
    summary: "12-class garbage classification using CNN feature extraction.",
    bullets: [
      "Extracted CNN embeddings with TensorFlow and trained classifiers in scikit-learn.",
    ],
    fullImageUrl: "/images/projects/source/waste-classification.png",
    imageUrl: "/images/projects/waste-classification.png",
    metrics: "MobileNetV2 Accuracy: 0.93; Weighted F1: 0.93",
    tags: ["tensorflow", "cnn", "classification"],
  },
  {
    id: "fraud-detection",
    name: "Bank Account Fraud Detection",
    institution: "American University of Sharjah - STA 401",
    summary: "Balanced data mining for bank account fraud risk.",
    bullets: [
      "Evaluated LDA, SMOTE, and Balanced Random Forest under severe class imbalance.",
      "Reported competitive recall and AUC for fraud-screening workflows.",
    ],
    fullImageUrl: "/images/projects/source/fraud-detection.png",
    imageUrl: "/images/projects/fraud-detection.png",
    metrics: "Recall: 0.79; AUC: 0.88",
    tags: ["data-mining", "smote", "fraud"],
  },
  {
    id: "attendance-event-app",
    name: "Attendance & Event App",
    institution: "AUS College of Engineering",
    summary: "Cross-platform event attendance app with offline caching.",
    bullets: [
      "Built the mobile client in Flutter for iOS and Android.",
      "Integrated a Node.js backend, configured notifications, and implemented offline caching.",
    ],
    fullImageUrl: "/images/projects/source/attendance-event-app.jpeg",
    imageUrl: "/images/projects/attendance-event-app.png",
    tags: ["flutter", "node", "events"],
  },
  {
    id: "reddit-clone",
    name: "Full-Stack Reddit Clone",
    institution: "Personal Project",
    summary: "Reddit-style full-stack app with authentication and PostgreSQL.",
    bullets: [
      "Built a Reddit-style frontend with React and Next.js.",
      "Created a Node.js and Express backend with PostgreSQL and JWT authentication.",
    ],
    fullImageUrl: "/images/projects/source/reddit-clone.png",
    imageUrl: "/images/projects/reddit-clone.png",
    repoUrl: "https://github.com/TaufiqSyed/reddit-clone/",
    tags: ["next", "express", "postgres"],
  },
  {
    id: "restaurant-management",
    name: "Restaurant Management Software",
    institution: "American University of Sharjah - CMP320",
    summary: "Restaurant operations system built with Next.js and Django.",
    bullets: [
      "Built the operations system using React, Next.js, and Django.",
      "Implemented user authentication and management features.",
    ],
    fullImageUrl: "/images/projects/source/restaurant-management.png",
    imageUrl: "/images/projects/restaurant-management.png",
    imagePosition: "left center",
    repoUrl: "https://github.com/TaufiqSyed/restaurant-app",
    tags: ["next", "django", "auth"],
  },
];

export const experiences: ExperienceItem[] = [
  {
    id: "belsons-full-stack",
    title: "Full Stack Developer",
    organization: "Belsons Technologies",
    period: "Aug 2025 - Present",
    location: "Dubai, UAE",
    summary: "ERP features, RBAC, and automated tests.",
    details: [
      "Extended a proprietary ERP system by developing and enhancing full-stack features to support evolving business needs.",
      "Architected a project-wide access control system for roles and permissions.",
      "Built multi-tenant management interfaces around the new RBAC model.",
      "Created automated tests to validate core business logic and improve system reliability.",
    ],
    siteUrl: "https://belsons.com/",
    logoUrl: "/images/logos/belsonslogo.jpg",
  },
  {
    id: "belsons-intern",
    title: "Software Engineering Intern",
    organization: "Belsons Technologies",
    period: "Jul 2024 - Aug 2024",
    location: "Dubai, UAE",
    summary: "AI market reports, image classification, and Django dashboards.",
    details: [
      "Built automated market reports using aggregate statistics and GPT-4 to generate narrative summaries.",
      "Implemented a property image classifier to categorize room types for listings.",
      "Developed Django admin dashboards to manage data inputs and review AI-generated insights.",
      "Computed area-based aggregates, including average rent and price per square foot, to support AI-generated outputs.",
    ],
    siteUrl: "https://belsons.com/",
    logoUrl: "/images/logos/belsonslogo.jpg",
  },
  {
    id: "ilmux-intern",
    title: "Software Engineering Intern",
    organization: "ILM UX Ltd.",
    period: "Jun 2022 - Sep 2022",
    location: "Mumbai, India",
    summary: "Testing, realtime chat, S3 uploads, and websocket status flows.",
    details: [
      "Wrote unit tests for frontend and backend components using Jest, improving baseline reliability.",
      "Built a real-time internal chat application using Socket.IO and a Node.js backend with React and Next.js.",
      "Integrated AWS S3 to support image and file uploads in the chat with signed URL handling.",
      "Implemented basic read receipts and message delivery statuses using WebSocket events.",
    ],
    siteUrl: "https://www.ilmux.com/en",
    logoUrl: "/images/logos/ilmuxlogo.jpg",
  },
];

export const researchItems: ResearchItem[] = [
  {
    id: "irrigation-estimation-app",
    title:
      "A Smartphone-Based Application for Crop Irrigation Estimation in Selected South and Southeast Asia Countries",
    summary:
      "Mobile irrigation estimation app for data-scarce South and Southeast Asian regions.",
    authors: "Daniel Simonet, Ajita Gupta, Taufiq Syed",
    institution: "American University of Sharjah",
    conference: "Sustainability 2026, 18(2), 990",
    venueShort: "MDPI Sustainability",
    conferenceDate: "2026",
    publicationDate: "January 18, 2026",
    publicationUrl: "https://www.mdpi.com/2071-1050/18/2/990",
    doi: "10.3390/su18020990",
    abstract:
      "A smartphone-based irrigation planning application that estimates net and gross irrigation requirements using a soil-water-balance workflow, public meteorological data, region-specific effective rainfall equations, and simulation benchmarking against FAO CROPWAT.",
    tags: ["flutter", "irrigation", "sustainability"],
  },
  {
    id: "self-reflective-story-generation",
    title:
      "Generative AI for Early Grade Story Generation Using a Self-Reflective Approach",
    summary: "Self-reflective GPT-4o story generation for EGRA assessments.",
    authors:
      "Taufiq Syed, Aadhith Shankarnarayanan, Yara Kaddoura, Salsabeel Shapsough, Imran Zualkernan, Ekaterina Kochmar",
    institution: "American University of Sharjah",
    conference:
      "IEEE International Conference on Advanced Learning Technologies (ICALT)",
    venueShort: "IEEE ICALT",
    conferenceDate: "July 14-17, 2025",
    publicationDate: "October 17, 2025",
    publicationUrl: "https://ieeexplore.ieee.org/document/11194798",
    doi: "10.1109/ICALT64023.2025.00058",
    abstract:
      "Self-reflective GPT-4o pipeline for early-grade reading assessment stories, using classic-tale grounding and iterative review to improve EGRA alignment, quality, scalability, and cost efficiency.",
    tags: ["gpt-4o", "egra", "education"],
  },
  {
    id: "tailored-tales",
    title:
      "Tailored Tales: Enhancing Children's Reading Comprehension with Preference-Tuned Automatic Story Generation",
    summary: "Preference tuning for children's reading comprehension stories.",
    authors:
      "Aadhith Shankarnarayanan, Taufiq Syed, Salsabeel Shapsough, Imran Zualkernan, Ekaterina Kochmar",
    institution: "American University of Sharjah",
    conference:
      "11th International Conference on Computing and Artificial Intelligence (ICCAI)",
    venueShort: "IEEE ICCAI",
    conferenceDate: "March 28-31, 2025",
    publicationDate: "August 11, 2025",
    publicationUrl: "https://ieeexplore.ieee.org/document/11105584",
    doi: "10.1109/ICCAI66501.2025.00057",
    abstract:
      "Preference-tuned automatic story generation for children's reading comprehension, improving coherence, readability, engagement, and EGRA alignment without the cost of full fine-tuning.",
    tags: ["preference-tuning", "llm", "education"],
  },
  {
    id: "once-upon-gpt4",
    title:
      "Once Upon a GPT-4: Enhancing Diversity in Automated Reading Comprehension Story Generation with Classic Tales",
    summary: "Classic-tales grounded GPT-4 story generation for EGRA.",
    authors:
      "Aadhith Shankarnarayanan, Taufiq Syed, Salsabeel Shapsough, Imran Zualkarnan",
    institution: "American University of Sharjah",
    conference:
      "IEEE International Conference on Advanced Learning Technologies (ICALT)",
    venueShort: "IEEE ICALT",
    conferenceDate: "July 1-4, 2024",
    publicationDate: "August 29, 2024",
    publicationUrl: "https://ieeexplore.ieee.org/document/10645935",
    doi: "10.1109/ICALT61570.2024.00063",
    abstract:
      "Classic-tales grounded GPT-4 story generation for early-grade reading assessments, focused on diversity, EGRA alignment, lower content-development cost, and human/text-metric evaluation.",
    tags: ["gpt-4", "icalt", "literacy"],
  },
  {
    id: "requirements-analysis",
    title:
      "Can GPT-4 Aid in Detecting Ambiguities, Inconsistencies, and Incompleteness in Requirements Analysis? A Comprehensive Case Study",
    summary: "GPT-4 evaluation for software requirements defect detection.",
    authors:
      "Taslim Mahbub, Dana Dghaym, Aadhith Shankarnarayanan, Taufiq Syed, Salsabeel Shapsough, Imran Zualkarnan",
    institution: "American University of Sharjah",
    conference: "IEEE Access (Volume 12)",
    venueShort: "IEEE Access",
    conferenceDate: "Published: September 19, 2024",
    publicationDate: "September 19, 2024",
    publicationUrl: "https://ieeexplore.ieee.org/document/10684184",
    doi: "10.1109/ACCESS.2024.3464242",
    abstract:
      "Zero-shot GPT-4 evaluation on real software requirements, measuring how well it detects ambiguity, inconsistency, and incompleteness in an industrial-style specification.",
    tags: ["gpt-4", "requirements", "ieee-access"],
  },
];

export const educationItems: EducationItem[] = [
  {
    id: "aus-computer-science",
    title: "Bachelor of Science in Computer Science",
    summary: "American University of Sharjah / Data Science minor.",
    meta: "09/2021 - 06/2025 / GPA 3.41",
    details: [
      "Built a foundation across AI, software engineering, and data-driven systems.",
      "Completed coursework in Neural Networks, Artificial Intelligence, Data Mining, Stochastic Systems, Recommendation Systems, and Database Systems.",
      "Balanced research, applied engineering projects, and technical community leadership.",
    ],
    tags: ["aus", "computer-science", "ai"],
  },
  {
    id: "certifications",
    title: "Certifications",
    summary: "Cloud fundamentals and deep learning training.",
    meta: "Professional development",
    details: [
      "AWS Certified Cloud Practitioner.",
      "Coursera Deep Learning Specialization.",
    ],
    tags: ["aws", "deep-learning", "certs"],
  },
  {
    id: "leadership",
    title: "Tech Leadership",
    summary: "Campus technical leadership and community building.",
    meta: "American University of Sharjah / 2023-2024",
    details: [
      "President of the Open Source Club from 2023 to 2024.",
      "Activities Coordinator for the Technopreneurship Club.",
      "Organized more than 15 events and led a 5-part Flutter workshop series.",
    ],
    tags: ["leadership", "community", "workshops"],
  },
  {
    id: "achievements",
    title: "Achievements",
    summary: "Hackathons, programming contests, and technical competitions.",
    meta: "2022-2025",
    details: [
      "Placed 2nd in Noon Cake Product Management Hackathon in 2025.",
      "2nd place in SoftwareAG GITEX Future Disruptors in 2023.",
      "1st place in the AUS Programming Contest in 2022.",
      "2nd place in the ADU STEM Programming Contest in 2022.",
      "Placed 2nd in AUS Tech-centric Hackathon in 2022.",
      "Participated in Gulf Programming Contest, placing 5th out of 30 teams in 2022.",
    ],
    tags: ["awards", "contests", "aus"],
  },
];
