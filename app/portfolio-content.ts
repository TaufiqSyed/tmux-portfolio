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
  tags?: string[];
};

export const profileContent: ProfileContent = {
  email: "taufiq.m.a.syed@gmail.com",
  githubUrl: "https://github.com/TaufiqSyed",
  headline: "full-stack engineer / research assistant / AI enthusiast",
  linkedinUrl: "https://www.linkedin.com/in/taufiq-syed/",
  location: "Dubai, UAE",
  name: "Taufiq Syed",
  resumePath: "/resume/Taufiq-Syed-CV-2025.pdf",
  summary:
    "Recent Computer Science graduate from the American University of Sharjah with a strong foundation in AI, data science, and software development.",
};

export const projects: ProjectItem[] = [
  {
    id: "music-structures",
    name: "Generation of High-Level Music Structures",
    institution: "American University of Sharjah - COE 476",
    summary: "MusicGen LoRA fine-tuning with structural prompt extraction.",
    bullets: [
      "Processed a music dataset into music-prompt pairs with extracted structural information.",
      "Finetuned the MusicGen transformer using a LoRA adaptor.",
    ],
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
      "Processed a 12-class garbage classification dataset using CNN feature extraction with TensorFlow and scikit-learn.",
    ],
    imageUrl: "/images/projects/waste-classification.png",
    metrics: "MobileNetV2 Accuracy: 0.93; Weighted F1: 0.93",
    tags: ["tensorflow", "cnn", "classification"],
  },
  {
    id: "fraud-detection",
    name: "Bank Account Fraud Detection",
    institution: "American University of Sharjah - STA 401",
    summary: "Balanced data mining for highly imbalanced fraud detection.",
    bullets: [
      "Used balanced data mining approaches including LDA, SMOTE, and Balanced Random Forest.",
      "Achieved competitive results on a highly imbalanced dataset.",
    ],
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
      "Utilized Flutter for cross-platform mobile application development.",
      "Integrated a Node.js backend, configured notifications, and implemented offline caching.",
    ],
    imageUrl: "/images/projects/attendance-event-app.png",
    tags: ["flutter", "node", "events"],
  },
  {
    id: "reddit-clone",
    name: "Full-Stack Reddit Clone",
    institution: "Personal Project",
    summary: "Reddit-style full-stack app with authentication and PostgreSQL.",
    bullets: [
      "Used React and Next.js to build a front-end clone of Reddit.",
      "Created a Node.js and Express backend with PostgreSQL and JWT authentication.",
    ],
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
      "Built a restaurant management system using React, Next.js, and Django.",
      "Implemented user authentication and management features.",
    ],
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
    summary: "ERP features, access control, RBAC, and automated tests.",
    details: [
      "Extended a proprietary ERP system by developing and enhancing full-stack features to support evolving business needs.",
      "Architected and implemented a project-wide access control system to manage roles and permissions securely.",
      "Implemented interfaces for multi-tenant management and fine-grained, role-based access control across the application.",
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
    id: "self-reflective-story-generation",
    title:
      "Generative AI for Early Grade Story Generation Using a Self-Reflective Approach",
    summary: "Self-reflective GPT-4o story generation for EGRA assessments.",
    authors:
      "Taufiq Syed, Aadhith Shankarnarayanan, Yara Kaddoura, Salsabeel Shapsough, Imran Zualkernan, Ekaterina Kochmar",
    institution: "American University of Sharjah",
    conference:
      "IEEE International Conference on Advanced Learning Technologies (ICALT)",
    conferenceDate: "July 14-17, 2025",
    publicationDate: "October 17, 2025",
    publicationUrl: "https://ieeexplore.ieee.org/document/11194798",
    doi: "10.1109/ICALT64023.2025.00058",
    abstract:
      "This paper presents a self-reflective story generation framework using GPT-4o to support large-scale early grade reading assessments. By grounding generation in classic tales and incorporating iterative self-reflection, the approach improves adherence to EGRA criteria while maintaining narrative diversity. Automated metrics and human evaluations show that the framework enhances story quality, scalability, and cost efficiency, offering a practical solution for literacy assessment development.",
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
    conferenceDate: "March 28-31, 2025",
    publicationDate: "August 11, 2025",
    publicationUrl: "https://ieeexplore.ieee.org/document/11105584",
    doi: "10.1109/ICCAI66501.2025.00057",
    abstract:
      "This study investigates preference tuning as a cost-effective alternative to full fine-tuning for generating high-quality children's reading comprehension stories. Using annotated examples inspired by classic tales, the approach improves story coherence, readability, and engagement while meeting EGRA standards. Results indicate that preference-tuned models outperform baseline LLMs, demonstrating strong potential for scalable and adaptable educational content generation.",
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
    conferenceDate: "July 1-4, 2024",
    publicationDate: "August 29, 2024",
    publicationUrl: "https://ieeexplore.ieee.org/document/10645935",
    doi: "10.1109/ICALT61570.2024.00063",
    abstract:
      "This paper addresses the challenge of generating reading comprehension content for early grade assessments, an expensive and time-consuming task. It proposes leveraging GPT-4 mediated by a classic tales database to generate diverse stories that align with EGRA criteria. This approach ensures fairness through narrative variation and reduced cost while maintaining educational standards. The paper presents a systematic framework for selecting, adapting, and evaluating stories using both text metrics and human review.",
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
    conferenceDate: "Published: September 19, 2024",
    publicationDate: "September 19, 2024",
    publicationUrl: "https://ieeexplore.ieee.org/document/10684184",
    doi: "10.1109/ACCESS.2024.3464242",
    abstract:
      "This paper explores GPT-4's performance in identifying defects in a real-world software requirements specification for a mechanical lung ventilator. Using a zero-shot setting, GPT-4 was evaluated for its ability to detect ambiguity, inconsistency, and incompleteness. The study found GPT-4 was strongest in identifying incompleteness, though it struggled with inconsistency and ambiguity. Results highlight both the potential and current limitations of LLMs in industrial-scale requirements analysis.",
    tags: ["gpt-4", "requirements", "ieee-access"],
  },
];

export const educationItems: EducationItem[] = [
  {
    id: "aus-computer-science",
    title: "Bachelor of Science in Computer Science",
    summary: "American University of Sharjah / GPA 3.41 / June 2025.",
    details: [
      "Studied computer science with a focus on AI, data science, and software systems.",
      "Relevant coursework included Neural Networks, Artificial Intelligence, Data Mining, and related computer science foundations.",
      "Built research and applied engineering work alongside student leadership and technical community organizing.",
    ],
    tags: ["aus", "computer-science", "ai"],
  },
  {
    id: "leadership",
    title: "Tech Leadership",
    summary: "Open Source Club presidency and campus tech community work.",
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
    summary: "Programming contests and GITEX Future Disruptors placements.",
    details: [
      "2nd place in SoftwareAG GITEX Future Disruptors in 2023.",
      "1st place in the AUS Programming Contest in 2022.",
      "2nd place in the ADU STEM Programming Contest in 2022.",
    ],
    tags: ["awards", "contests", "aus"],
  },
];
