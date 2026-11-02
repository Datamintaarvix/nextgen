// ── NEXTGEN DMA VENTURES — Premium Glassmorphism UI Engine ──
// Palette: Pure White (#FFFFFF) + Pure Black (#000000) + Mint Teal (#65D2C5)
if (window.tailwind) {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    white:       '#FFFFFF',
                    black:       '#000000',
                    mint:        '#65D2C5',
                    'mint-light':'#8ae2d8',
                    'mint-dark': '#4dbcb0',
                    charcoal:    '#000000',
                    graphite:    '#111111',
                    deepteal:    '#65D2C5',
                    vibrantteal: '#65D2C5',
                    lightteal:   '#65D2C5',
                    offwhite:    '#FFFFFF',
                    offwhite2:   '#F7F9F8',
                    brand: {
                        50:  '#F7F9F8',
                        100: '#e8f7f6',
                        300: '#8ae2d8',
                        400: '#65D2C5',
                        500: '#65D2C5',
                        600: '#65D2C5',
                        700: '#4dbcb0',
                        800: '#000000',
                        900: '#000000',
                        950: '#000000',
                    },
                    accent: {
                        300: '#8ae2d8',
                        400: '#65D2C5',
                        500: '#65D2C5',
                        600: '#4dbcb0',
                        700: '#3da59a',
                    }
                },
                fontFamily: {
                    display: ['"Bebas Neue"', 'sans-serif'],
                    sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
                    mono:    ['"Space Grotesk"', 'monospace'],
                }
            }
        }
    }
}

// =========================================================================
// CENTRALIZED OFFICIAL COURSE & INTERNSHIP DATABASE (ALL 47 COURSES)
// =========================================================================
const COURSES_DATA = [
    // -------------------------------------------------------------
    // CATEGORY 1: ARTIFICIAL INTELLIGENCE & DATA TECHNOLOGIES (5)
    // -------------------------------------------------------------
    {
        id: "ai-001",
        name: "Artificial Intelligence (AI)",
        title: "Artificial Intelligence (AI)",
        category: "Artificial Intelligence & Data Technologies",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 34999,
        formattedFee: "₹34,999",
        currency: "INR",
        badge: "Hot Career",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
        description: "Comprehensive curriculum mastering Generative AI, Deep Learning architectures, Neural Networks, NLP, and LLM orchestration with Python.",
        overview: "Comprehensive curriculum mastering Generative AI, Deep Learning architectures, Neural Networks, NLP, and LLM orchestration with Python.",
        skills: ["Python", "PyTorch", "TensorFlow", "OpenAI API", "LangChain", "HuggingFace", "Neural Networks"],
        tools: ["Python", "PyTorch", "TensorFlow", "OpenAI API", "LangChain", "HuggingFace"],
        learningOutcomes: [
            "Mathematical foundations of AI, linear algebra & calculus for deep learning",
            "Deep Neural Networks, CNNs for computer vision & RNNs/LSTMs",
            "Transformer architectures, attention mechanisms & NLP pipelines",
            "Generative AI agent development, vector databases & LangChain RAG systems",
            "Model quantization, fine-tuning and enterprise API deployment"
        ],
        modules: [
            "Module 1: Foundations of Artificial Intelligence & Math for AI",
            "Module 2: Neural Networks & Deep Learning with PyTorch",
            "Module 3: Natural Language Processing (NLP) & Transformer Models",
            "Module 4: Generative AI, LLM Prompt Engineering & LangChain",
            "Module 5: Capstone: Building & Deploying an AI Enterprise Bot"
        ],
        internship: "8-week intensive capstone building and deploying an enterprise-grade AI chatbot with vector search and multi-turn memory.",
        targetAudience: "Engineering Graduates, IT Professionals, STEM Students, AI Enthusiasts",
        careerRoles: "AI Engineer, NLP Specialist, Machine Learning Architect"
    },
    {
        id: "ai-002",
        name: "Machine Learning",
        title: "Machine Learning",
        category: "Artificial Intelligence & Data Technologies",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 34999,
        formattedFee: "₹34,999",
        currency: "INR",
        badge: "High Demand",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=600&q=80",
        description: "Master supervised and unsupervised learning algorithms, statistical data wrangling, feature engineering, and production MLOps deployment.",
        overview: "Master supervised and unsupervised learning algorithms, statistical data wrangling, feature engineering, and production MLOps deployment.",
        skills: ["Python", "Scikit-Learn", "Pandas", "NumPy", "XGBoost", "MLflow", "Docker", "Feature Engineering"],
        tools: ["Python", "Scikit-Learn", "Pandas", "NumPy", "XGBoost", "MLflow"],
        learningOutcomes: [
            "Advanced statistical analysis, hypothesis testing and data wrangling",
            "Supervised learning: regression, classification, random forests, boosting algorithms",
            "Unsupervised clustering, dimensionality reduction (PCA, t-SNE) and anomaly detection",
            "Hyperparameter tuning, cross-validation, and bias-variance tradeoff optimization",
            "MLOps pipelines with Docker, automated model registry, and REST API deployment"
        ],
        modules: [
            "Module 1: Advanced Statistical Analysis & Data Wrangling",
            "Module 2: Supervised & Unsupervised Machine Learning Algorithms",
            "Module 3: Model Evaluation, Hyperparameter Tuning & Cross-Validation",
            "Module 4: Machine Learning Pipeline & MLOps with Docker",
            "Module 5: Real-World Predictive Analytics Capstone Project"
        ],
        internship: "End-to-end predictive analytics deployment predicting customer churn with automated CI/CD retraining pipelines.",
        targetAudience: "Software Developers, Data Analysts, Math/Stats Graduates",
        careerRoles: "Machine Learning Engineer, Data Scientist, ML Analyst"
    },
    {
        id: "ai-003",
        name: "Data Analytics & Science",
        title: "Data Analytics & Science",
        category: "Artificial Intelligence & Data Technologies",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 32999,
        formattedFee: "₹32,999",
        currency: "INR",
        badge: "Executive Track",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        description: "Transform multi-million row datasets into high-impact corporate intelligence using advanced SQL, Python analytics, Power BI, and statistical modeling.",
        overview: "Transform multi-million row datasets into high-impact corporate intelligence using advanced SQL, Python analytics, Power BI, and statistical modeling.",
        skills: ["Advanced SQL", "Power BI", "Python Pandas", "Tableau", "DAX Studio", "Data Warehousing", "ETL Pipelines"],
        tools: ["SQL", "Power BI", "Excel", "Tableau", "Python Data Viz"],
        learningOutcomes: [
            "Complex SQL querying with CTEs, window functions and stored procedures",
            "Data wrangling and statistical computation with Python Pandas and NumPy",
            "Interactive dashboard architecture with Microsoft Power BI and DAX Studio",
            "Exploratory data analysis, cohort analysis, and executive storytelling",
            "Data warehousing principles and automated ETL data ingestion"
        ],
        modules: [
            "Module 1: Business Analytics Fundamentals & Exploratory Data Analysis",
            "Module 2: Advanced SQL Querying, Views & Stored Procedures",
            "Module 3: Visual Analytics with Power BI & Tableau",
            "Module 4: Statistical Modeling with Excel & Python",
            "Module 5: Live Business Insights Dashboards Capstone"
        ],
        internship: "Live enterprise BI migration capstone replacing legacy spreadsheets with interactive real-time executive Power BI dashboards.",
        targetAudience: "Fresh Graduates, Business Analysts, Finance & Ops Professionals",
        careerRoles: "Data Scientist, Business Intelligence Developer, Senior Data Analyst"
    },
    {
        id: "ai-004",
        name: "Python",
        title: "Python",
        category: "Artificial Intelligence & Data Technologies",
        duration: 20,
        durationUnit: "Weeks",
        durationText: "20 Weeks",
        fee: 24999,
        formattedFee: "₹24,999",
        currency: "INR",
        badge: "Foundation Pillar",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        description: "Master modern Python programming from algorithmic fundamentals to object-oriented architectures, web scraping, and automated script engineering.",
        overview: "Master modern Python programming from algorithmic fundamentals to object-oriented architectures, web scraping, and automated script engineering.",
        skills: ["Core Python 3.12+", "OOP Concepts", "Data Structures", "Web Scraping (BeautifulSoup)", "REST APIs", "Unit Testing", "Automation"],
        tools: ["Python", "PyCharm", "VS Code", "Requests", "BeautifulSoup", "Git"],
        learningOutcomes: [
            "Control structures, functions, lambda expressions, and memory management",
            "Object-Oriented Programming: inheritance, polymorphism, encapsulation, dunder methods",
            "File I/O, JSON handling, regex pattern matching, and error handling",
            "Web scraping, HTTP requests, and third-party REST API integration",
            "Building modular, reusable automation scripts and testing with pytest"
        ],
        modules: [
            "Module 1: Python Essentials, Data Structures & Control Flow",
            "Module 2: Object-Oriented Programming (OOP) & Modules",
            "Module 3: File I/O, Web Scraping & REST APIs",
            "Module 4: Error Handling, Logging & Unit Testing with PyTest",
            "Module 5: Practical Automation Suite Capstone"
        ],
        internship: "Automated web scraping and data aggregation bot parsing dynamic market listings into clean structured databases.",
        targetAudience: "Beginners, Non-CS Graduates, Engineers looking to transition into software",
        careerRoles: "Python Developer, Automation Engineer, Software Associate"
    },
    {
        id: "ai-005",
        name: "Advanced Excel, SQL & Power BI",
        title: "Advanced Excel, SQL & Power BI",
        category: "Artificial Intelligence & Data Technologies",
        duration: 20,
        durationUnit: "Weeks",
        durationText: "20 Weeks",
        fee: 22999,
        formattedFee: "₹22,999",
        currency: "INR",
        badge: "Business Essential",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        description: "The gold-standard trio for corporate business intelligence. Master dynamic Excel modeling, nested SQL querying, and enterprise Power BI reporting.",
        overview: "The gold-standard trio for corporate business intelligence. Master dynamic Excel modeling, nested SQL querying, and enterprise Power BI reporting.",
        skills: ["Excel Power Query", "Advanced VLOOKUP/XLOOKUP", "Pivot Tables", "SQL Window Functions", "Power BI", "DAX Formulas", "KPI Visualizations"],
        tools: ["Microsoft Excel", "PostgreSQL", "Power BI Desktop", "DAX Studio"],
        learningOutcomes: [
            "Advanced Excel modeling: INDEX/MATCH, XLOOKUP, dynamic arrays, nested logic",
            "Power Query for automated data cleanup, transformation, and ETL workflows",
            "Relational database querying with SQL: multi-table joins, subqueries, aggregations",
            "Power BI data modeling, star schema design, relationships and DAX measures",
            "Designing executive-level interactive reports with bookmarks and drill-throughs"
        ],
        modules: [
            "Module 1: Advanced Excel Formulas & Dynamic Dashboard Modeling",
            "Module 2: Power Query Data Transformation & Automation",
            "Module 3: Comprehensive SQL Querying & Relational Databases",
            "Module 4: Microsoft Power BI Architecture & DAX Measures",
            "Module 5: Corporate Sales & Operations Dashboard Capstone"
        ],
        internship: "Complete corporate reporting automation project connecting live SQL database tables to a synchronized executive Power BI suite.",
        targetAudience: "Commerce, Finance, Operations Graduates & Aspiring Business Analysts",
        careerRoles: "BI Analyst, Financial Reporting Associate, MIS Executive"
    },

    // -------------------------------------------------------------
    // CATEGORY 2: SOFTWARE DEVELOPMENT (6)
    // -------------------------------------------------------------
    {
        id: "sd-001",
        name: "Web Development",
        title: "Web Development",
        category: "Software Development",
        duration: 26,
        durationUnit: "Weeks",
        durationText: "26 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Core Engineering",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80",
        description: "Build modern, accessible, high-performance web applications with semantic HTML5, modern CSS3/Tailwind, JavaScript ES6+, and React.",
        overview: "Build modern, accessible, high-performance web applications with semantic HTML5, modern CSS3/Tailwind, JavaScript ES6+, and React.",
        skills: ["HTML5", "CSS3 / Tailwind", "JavaScript (ES6+)", "React.js", "REST APIs", "Node.js Basics", "Git / GitHub"],
        tools: ["VS Code", "React.js", "Tailwind CSS", "Vite", "Git", "Postman"],
        learningOutcomes: [
            "Semantic HTML5, CSS Grid, Flexbox, responsive web design principles",
            "JavaScript deep dive: closures, asynchronous event loop, promises, fetch API",
            "React component lifecycle, hooks, state management and custom hooks",
            "Consuming third-party RESTful APIs with secure error boundaries",
            "Modern deployment workflows on Vercel, Netlify and GitHub Pages"
        ],
        modules: [
            "Module 1: Semantic Markup & Modern CSS3 Layout Architecture",
            "Module 2: Core JavaScript & Asynchronous Event-Driven Programming",
            "Module 3: React.js Component Architecture, Hooks & Routing",
            "Module 4: State Management, Form Validation & API Integration",
            "Module 5: High-Converting Digital Storefront Capstone"
        ],
        internship: "Live multi-tenant web application sprint building a production-grade responsive portal with dark/light themes and API integrations.",
        targetAudience: "Engineering Graduates, Web Enthusiasts, Frontend Career Seekers",
        careerRoles: "Frontend Developer, React Specialist, Web Application Engineer"
    },
    {
        id: "sd-002",
        name: "App Development",
        title: "App Development",
        category: "Software Development",
        duration: 26,
        durationUnit: "Weeks",
        durationText: "26 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Mobile Specialist",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
        description: "Engineer native-performance cross-platform mobile apps for Android and iOS using Flutter, Dart, Firebase authentication, and SQLite.",
        overview: "Engineer native-performance cross-platform mobile apps for Android and iOS using Flutter, Dart, Firebase authentication, and SQLite.",
        skills: ["Flutter", "Dart", "Firebase Auth & Firestore", "State Management (Provider/Bloc)", "Native Device APIs", "REST APIs", "App Store Publishing"],
        tools: ["Android Studio", "Flutter SDK", "Dart", "Firebase", "Postman"],
        learningOutcomes: [
            "Dart object-oriented programming, asynchronous streams, and null safety",
            "Flutter widget tree, declarative UI patterns, responsive layouts for mobile & tablet",
            "State management with Provider and Bloc architecture",
            "Cloud Firestore database sync, push notifications, and biometric authentication",
            "Building release APKs and deploying apps to Google Play Store and Apple App Store"
        ],
        modules: [
            "Module 1: Dart Language Mastery & Flutter Widget Architecture",
            "Module 2: State Management with Provider & Bloc",
            "Module 3: Hardware Sensor Integration & Device APIs (Camera, GPS)",
            "Module 4: Firebase Realtime Backend & Cloud Push Notifications",
            "Module 5: Complete Cross-Platform Mobile Commerce App Capstone"
        ],
        internship: "Developing a production-ready mobile e-commerce and booking app with offline sync, payment gateways, and push notifications.",
        targetAudience: "Aspiring Mobile Developers, CS/IT Students, Software Engineers",
        careerRoles: "Flutter Developer, Mobile App Engineer, Android/iOS Specialist"
    },
    {
        id: "sd-003",
        name: "Software Development",
        title: "Software Development",
        category: "Software Development",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 32999,
        formattedFee: "₹32,999",
        currency: "INR",
        badge: "Enterprise Flagship",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        description: "Comprehensive software engineering career track: Java 17, Spring Boot microservices, PostgreSQL, clean architecture, Docker, and system design.",
        overview: "Comprehensive software engineering career track: Java 17, Spring Boot microservices, PostgreSQL, clean architecture, Docker, and system design.",
        skills: ["Java 17+", "Spring Boot", "Microservices", "PostgreSQL", "Docker", "RESTful APIs", "System Design", "JUnit & Mockito"],
        tools: ["IntelliJ IDEA", "Java", "Spring Boot", "PostgreSQL", "Docker", "Postman", "Git"],
        learningOutcomes: [
            "Advanced Java: memory model, concurrency, streams API, and design patterns",
            "Spring Boot ecosystem: Dependency Injection, Spring Data JPA, Spring Security",
            "Microservices architecture with service discovery, API gateway and message brokers",
            "Relational database schema optimization, indexing, and transactional integrity",
            "High-level and low-level system design for scalable, fault-tolerant platforms"
        ],
        modules: [
            "Module 1: Advanced Java, OOP & Clean Architecture Principles",
            "Module 2: Spring Boot Microservices & Database Persistance (JPA/Hibernate)",
            "Module 3: Spring Security, JWT Authentication & API Gateway Architecture",
            "Module 4: Concurrency, Asynchronous Event Queues & System Design",
            "Module 5: High-Concurrency Banking & Payment Gateway Backend Capstone"
        ],
        internship: "Architecting a multi-service banking backend handling concurrent transactions with JWT security and Dockerized deployment.",
        targetAudience: "Engineering Graduates, Career Switchers, Junior Developers",
        careerRoles: "Software Development Engineer (SDE-1), Backend Developer, Enterprise Java Engineer"
    },
    {
        id: "sd-004",
        name: "Full Stack Development",
        title: "Full Stack Development",
        category: "Software Development",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Top Placement",
        image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=600&q=80",
        description: "Master full-cycle web engineering across the MERN stack (MongoDB, Express.js, React.js, Node.js), TypeScript, REST APIs, and cloud deployments.",
        overview: "Master full-cycle web engineering across the MERN stack (MongoDB, Express.js, React.js, Node.js), TypeScript, REST APIs, and cloud deployments.",
        skills: ["MongoDB", "Express.js", "React.js", "Node.js", "TypeScript", "REST APIs", "JWT Auth", "Docker"],
        tools: ["Node.js", "React.js", "MongoDB Atlas", "Express", "Postman", "Git", "VS Code"],
        learningOutcomes: [
            "Full stack JavaScript & TypeScript runtime execution environments",
            "Building RESTful backends with Express.js and middleware architecture",
            "MongoDB schema design, aggregation pipelines, and indexing with Mongoose",
            "React frontend state management, server-side data fetching, and optimistic updates",
            "End-to-end authentication with JWT tokens, refresh cookies, and role-based access"
        ],
        modules: [
            "Module 1: Modern JavaScript ES6+ & TypeScript Essentials",
            "Module 2: Backend Architecture with Node.js & Express.js REST APIs",
            "Module 3: Database Modeling with MongoDB & Mongoose Aggregations",
            "Module 4: Interactive React.js Frontend & Full-Stack Integration",
            "Module 5: SaaS Multi-Tenant Cloud Web Platform Capstone"
        ],
        internship: "Collaborative Agile team build of a complete SaaS multi-tenant web platform with user onboarding, analytics, and stripe payments.",
        targetAudience: "Freshers, Aspiring Full-Stack Engineers, Computer Science Students",
        careerRoles: "Full Stack Developer, MERN Stack Specialist, Web Application Developer"
    },
    {
        id: "sd-005",
        name: "Java Programming",
        title: "Java Programming",
        category: "Software Development",
        duration: 22,
        durationUnit: "Weeks",
        durationText: "22 Weeks",
        fee: 24999,
        formattedFee: "₹24,999",
        currency: "INR",
        badge: "Enterprise Standard",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        description: "Master foundational to advanced Java: OOP principles, memory mechanics, collections framework, multithreading, JDBC, and unit testing.",
        overview: "Master foundational to advanced Java: OOP principles, memory mechanics, collections framework, multithreading, JDBC, and unit testing.",
        skills: ["Core Java 17", "OOP Paradigms", "Collections Framework", "Multithreading & Concurrency", "JDBC", "File Handling", "JUnit"],
        tools: ["IntelliJ IDEA", "Eclipse", "Java JDK", "MySQL", "Maven", "Git"],
        learningOutcomes: [
            "Deep comprehension of JVM architecture, bytecodes, garbage collection",
            "Robust implementation of inheritance, interfaces, polymorphism and abstraction",
            "High-performance data manipulation using Java Collections (List, Set, Map, Queue)",
            "Concurrent multi-threaded execution, locks, synchronization, and race conditions",
            "Database connectivity via JDBC and automated unit testing with JUnit"
        ],
        modules: [
            "Module 1: Java Basics, Syntax, Variables & Object-Oriented Fundamentals",
            "Module 2: Advanced OOP, Interfaces & Exception Handling Mechanisms",
            "Module 3: Comprehensive Collections Framework & Generic Programming",
            "Module 4: Concurrency, Thread Pools & File Input/Output Streams",
            "Module 5: Inventory & Payroll Enterprise Management System Capstone"
        ],
        internship: "Engineering an enterprise inventory and payroll backend system utilizing concurrent file processing and relational database storage.",
        targetAudience: "Beginners, College Students, IT Aspirants needing a strong programming base",
        careerRoles: "Java Developer, Associate Software Engineer, Backend Trainee"
    },
    {
        id: "sd-006",
        name: "Django Development",
        title: "Django Development",
        category: "Software Development",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Rapid Backend",
        image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=600&q=80",
        description: "Build robust, secure, and rapid enterprise web platforms using Python, Django, Django REST Framework, PostgreSQL, and Celery.",
        overview: "Build robust, secure, and rapid enterprise web platforms using Python, Django, Django REST Framework, PostgreSQL, and Celery.",
        skills: ["Python", "Django Framework", "Django REST Framework (DRF)", "PostgreSQL", "Celery & Redis", "JWT Authentication", "Docker"],
        tools: ["Python", "Django", "PostgreSQL", "Redis", "Postman", "Docker"],
        learningOutcomes: [
            "Django MVT (Model-View-Template) architectural pattern and ORM database queries",
            "Building secure RESTful web APIs with Django REST Framework serializers",
            "Custom user authentication, password reset workflows, and role permissions",
            "Asynchronous task queues with Celery and Redis message brokers",
            "Containerization and deployment on cloud platforms with PostgreSQL"
        ],
        modules: [
            "Module 1: Python Advanced Concepts & Django Architecture Overview",
            "Module 2: Django ORM, Models, Migrations & Database Relationships",
            "Module 3: Building Scalable RESTful Web APIs with Django REST Framework",
            "Module 4: Background Workers with Celery, Redis Caching & Security",
            "Module 5: Enterprise Content Portal & Marketplace API Capstone"
        ],
        internship: "Developing a full-scale digital marketplace API backend complete with asynchronous email notifications, file uploads, and caching.",
        targetAudience: "Python Developers, Computer Science Graduates, Backend Engineers",
        careerRoles: "Django Developer, Python Backend Engineer, Web Services Specialist"
    },

    // -------------------------------------------------------------
    // CATEGORY 3: SECURITY & INFRASTRUCTURE (3)
    // -------------------------------------------------------------
    {
        id: "si-001",
        name: "Cyber Security",
        title: "Cyber Security",
        category: "Security & Infrastructure",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Defense Specialist",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
        description: "Learn ethical hacking, penetration testing, network defense, SIEM event monitoring, OWASP Top 10 vulnerabilities, and digital forensics.",
        overview: "Learn ethical hacking, penetration testing, network defense, SIEM event monitoring, OWASP Top 10 vulnerabilities, and digital forensics.",
        skills: ["Ethical Hacking", "Kali Linux", "Wireshark", "Metasploit", "Burp Suite", "OWASP Top 10", "Network Security", "SIEM (Splunk)"],
        tools: ["Kali Linux", "Wireshark", "Metasploit", "Burp Suite", "Nmap", "Splunk"],
        learningOutcomes: [
            "Network protocols analysis, packet inspection, and firewall configuration",
            "Web application vulnerability assessment (SQLi, XSS, CSRF, SSRF)",
            "Penetration testing methodologies and ethical exploit execution",
            "Security Information & Event Management (SIEM) log monitoring with Splunk",
            "Incident response protocols and comprehensive security audit reporting"
        ],
        modules: [
            "Module 1: Networking Fundamentals, Protocols & Security Basics",
            "Module 2: Ethical Hacking & Penetration Testing Techniques",
            "Module 3: Web Application Vulnerability Assessment (OWASP Top 10)",
            "Module 4: Security Information & Event Management (SIEM)",
            "Module 5: Simulated Cyber Attack Defense Capstone Lab"
        ],
        internship: "Simulated corporate red-team/blue-team cyber defense lab identifying network flaws and authoring mitigation audit reports.",
        targetAudience: "IT Engineers, Network Administrators, System Admins, Cyber Enthusiasts",
        careerRoles: "Cybersecurity Analyst, SOC Analyst, Ethical Hacker, Security Consultant"
    },
    {
        id: "si-002",
        name: "Cloud Computing",
        title: "Cloud Computing",
        category: "Security & Infrastructure",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Cloud Certified",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        description: "Architect and manage enterprise cloud infrastructures across AWS and Microsoft Azure. Learn virtualization, IAM security, VPC, and serverless.",
        overview: "Architect and manage enterprise cloud infrastructures across AWS and Microsoft Azure. Learn virtualization, IAM security, VPC, and serverless.",
        skills: ["AWS Solutions Architecture", "Microsoft Azure", "Virtual Private Cloud (VPC)", "IAM Security", "Terraform Basics", "Serverless Lambda", "Cost Governance"],
        tools: ["AWS Console", "Azure Portal", "Terraform", "CloudWatch", "Linux CLI"],
        learningOutcomes: [
            "Cloud architecture principles: high availability, elasticity, fault tolerance",
            "Deep AWS core services: EC2, S3, RDS, Lambda, DynamoDB, CloudFront, Route53",
            "Azure enterprise infrastructure: Virtual Machines, Azure Blob, Active Directory",
            "Infrastructure as Code (IaC) provisioning with basic Terraform",
            "Cloud security policies, backup disaster recovery, and cost monitoring"
        ],
        modules: [
            "Module 1: Cloud Architecture Fundamentals & Virtualization",
            "Module 2: AWS Core Services: EC2, S3, RDS, VPC & IAM",
            "Module 3: Azure Infrastructure Solutions & Identity Management",
            "Module 4: Cloud Security, Cost Optimization & Serverless Setup",
            "Module 5: Multi-Cloud Infrastructure Migration Capstone"
        ],
        internship: "Multi-cloud architecture project designing an auto-scaling, fault-tolerant enterprise web application across AWS and Azure.",
        targetAudience: "System Administrators, IT Support, Engineering Graduates",
        careerRoles: "Cloud Solutions Architect, Cloud Engineer, AWS Infrastructure Specialist"
    },
    {
        id: "si-003",
        name: "DevOps Engineering",
        title: "DevOps Engineering",
        category: "Security & Infrastructure",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "High Growth",
        image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80",
        description: "Bridge the gap between development and operations: Linux, Docker, Kubernetes, Jenkins CI/CD, Terraform IaC, Ansible, and Prometheus monitoring.",
        overview: "Bridge the gap between development and operations: Linux, Docker, Kubernetes, Jenkins CI/CD, Terraform IaC, Ansible, and Prometheus monitoring.",
        skills: ["Docker Containerization", "Kubernetes Orchestration", "CI/CD Pipelines (Jenkins)", "Terraform (IaC)", "Ansible", "Linux Shell Scripting", "Prometheus & Grafana"],
        tools: ["Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "Git", "AWS"],
        learningOutcomes: [
            "Linux system administration, bash scripting, and user permission management",
            "Building lightweight, secure container images with Docker and multi-stage builds",
            "Kubernetes cluster administration, deployments, services, ingress, and helm charts",
            "Automating end-to-end CI/CD delivery pipelines with Jenkins and GitHub Actions",
            "Zero-downtime rolling updates, canary releases, and Prometheus/Grafana alerting"
        ],
        modules: [
            "Module 1: Linux System Administration & Shell Scripting",
            "Module 2: Containerization with Docker & Container Orchestration with Kubernetes",
            "Module 3: Continuous Integration & Delivery via Jenkins & GitHub Actions",
            "Module 4: Infrastructure as Code (IaC) with Terraform & Ansible",
            "Module 5: End-to-End Automated Cloud Pipeline Capstone"
        ],
        internship: "Building an automated enterprise CI/CD pipeline deploying microservices to an AWS Kubernetes cluster with zero-downtime rollouts.",
        targetAudience: "Developers, SysAdmins, Infrastructure Engineers, STEM Graduates",
        careerRoles: "DevOps Engineer, Site Reliability Engineer (SRE), Cloud Operations Specialist"
    },

    // -------------------------------------------------------------
    // CATEGORY 4: DESIGN & QUALITY (3)
    // -------------------------------------------------------------
    {
        id: "dq-001",
        name: "UI/UX Design",
        title: "UI/UX Design",
        category: "Design & Quality",
        duration: 22,
        durationUnit: "Weeks",
        durationText: "22 Weeks",
        fee: 19999,
        formattedFee: "₹19,999",
        currency: "INR",
        badge: "Creative Excellence",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80",
        description: "Create human-centered, high-converting digital products. Master Figma, wireframing, interactive prototyping, user research, and design systems.",
        overview: "Create human-centered, high-converting digital products. Master Figma, wireframing, interactive prototyping, user research, and design systems.",
        skills: ["Figma Mastery", "User Research & Personas", "Wireframing & Flowcharts", "Interactive Prototyping", "Design Systems & Auto-Layout", "Usability Testing", "UI Glassmorphism"],
        tools: ["Figma", "Adobe XD", "Miro", "Protopie", "UsabilityHub"],
        learningOutcomes: [
            "Conducting qualitative and quantitative user interviews and journey mapping",
            "Low-fidelity wireframing and information architecture hierarchy",
            "High-fidelity UI creation using Figma auto-layout, component variants, and tokens",
            "Creating responsive design systems matching international brand guidelines",
            "Interactive micro-interactions, micro-animations, and usability lab testing"
        ],
        modules: [
            "Module 1: Design Thinking, User Research & Persona Creation",
            "Module 2: Wireframing, Information Architecture & UX Writing",
            "Module 3: High-Fidelity UI Design with Figma & Visual Hierarchy",
            "Module 4: Interactive Prototyping & Usability Testing",
            "Module 5: Complete Product Redesign Portfolio Capstone"
        ],
        internship: "Complete end-to-end design sprint for a fintech mobile application resulting in a published Behance case study and Figma prototype.",
        targetAudience: "Graphic Designers, Creative Thinkers, Frontend Engineers, Product Enthusiasts",
        careerRoles: "UI/UX Designer, Product Designer, Interaction Designer, Visual Lead"
    },
    {
        id: "dq-002",
        name: "Digital Marketing",
        title: "Digital Marketing",
        category: "Design & Quality",
        duration: 20,
        durationUnit: "Weeks",
        durationText: "20 Weeks",
        fee: 18999,
        formattedFee: "₹18,999",
        currency: "INR",
        badge: "Growth Engine",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80",
        description: "Master multi-channel performance marketing: Search Engine Optimization (SEO), Google Search & Display Ads, Meta Ad Manager, GA4, and funnels.",
        overview: "Master multi-channel performance marketing: Search Engine Optimization (SEO), Google Search & Display Ads, Meta Ad Manager, GA4, and funnels.",
        skills: ["Technical SEO", "Google Ads (PPC)", "Meta Ads Manager", "Google Analytics 4 (GA4)", "Conversion Rate Optimization", "Content Strategy", "Email Automation"],
        tools: ["Google Ads", "Meta Ads Manager", "GA4", "SEMrush", "Mailchimp"],
        learningOutcomes: [
            "Technical, on-page and off-page SEO algorithms and keyword clustering",
            "Formulating high-ROI paid search campaigns on Google Ads with negative keywords",
            "Targeting high-intent audiences on Meta Ads (Facebook & Instagram) with retargeting",
            "Analyzing traffic funnels and tracking custom user events with Google Analytics 4",
            "Email marketing automation sequences and landing page conversion optimization"
        ],
        modules: [
            "Module 1: Search Engine Optimization (SEO - Technical & On-Page)",
            "Module 2: Pay-Per-Click Advertising (Google Ads, Meta Ads & LinkedIn)",
            "Module 3: Content Marketing, Copywriting & Email Automation",
            "Module 4: Web Analytics with Google Analytics 4 (GA4) & Tag Manager",
            "Module 5: Live Brand Growth Campaign Capstone"
        ],
        internship: "Live multi-channel performance marketing campaign managing real ad spend to achieve verifiable customer acquisitions.",
        targetAudience: "Graduates, Entrepreneurs, Business Owners, Marketing Associates",
        careerRoles: "Digital Marketing Specialist, Performance Marketer, SEO Strategist"
    },
    {
        id: "dq-003",
        name: "Software Testing & Automation",
        title: "Software Testing & Automation",
        category: "Design & Quality",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 23999,
        formattedFee: "₹23,999",
        currency: "INR",
        badge: "QA Specialist",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
        description: "Master manual QA methodologies alongside test automation using Java, Selenium WebDriver, TestNG, Postman API testing, and Cucumber BDD.",
        overview: "Master manual QA methodologies alongside test automation using Java, Selenium WebDriver, TestNG, Postman API testing, and Cucumber BDD.",
        skills: ["Manual QA & Test Cases", "Selenium WebDriver", "Java for QA", "TestNG Framework", "Postman & RestAssured", "Cucumber BDD", "JIRA & Agile"],
        tools: ["Selenium", "Java", "TestNG", "Postman", "JIRA", "Git"],
        learningOutcomes: [
            "SDLC, STLC, test plan documentation, bug reporting and defect life cycles in JIRA",
            "Object-oriented Java fundamentals tailored specifically for automation suites",
            "Selenium WebDriver architecture: locators, dynamic waits, popups, and frames",
            "Designing hybrid Page Object Model (POM) frameworks using TestNG",
            "REST API automated validation using Postman assertions and RestAssured library"
        ],
        modules: [
            "Module 1: Software Development Life Cycle (SDLC) & Manual QA Techniques",
            "Module 2: Automated Web Testing with Selenium WebDriver & Java",
            "Module 3: REST API Testing using Postman & RestAssured",
            "Module 4: TestNG Framework, Page Object Model (POM) & CI/CD Testing",
            "Module 5: E-Commerce Web & API Automation Suite Capstone"
        ],
        internship: "Building an automated regression testing framework executing 150+ cross-browser test scripts for an enterprise banking simulator.",
        targetAudience: "Non-Technical Graduates, Manual Testers, Career Switchers",
        careerRoles: "Automation Test Engineer, QA Analyst, Quality Assurance Specialist"
    },

    // -------------------------------------------------------------
    // CATEGORY 5: MECHANICAL ENGINEERING (10)
    // -------------------------------------------------------------
    {
        id: "me-001",
        name: "AutoCAD Mechanical",
        title: "AutoCAD Mechanical",
        category: "Mechanical Engineering",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 26499,
        formattedFee: "₹26,499",
        currency: "INR",
        badge: "Industry Standard",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        description: "Master 2D drafting and mechanical drawing standards with AutoCAD. Learn GD&T, layer standards, orthographic projections, and bill of materials.",
        overview: "Master 2D drafting and mechanical drawing standards with AutoCAD. Learn GD&T, layer standards, orthographic projections, and bill of materials.",
        skills: ["AutoCAD Mechanical", "Geometric Dimensioning & Tolerancing (GD&T)", "Orthographic & Isometric Projections", "Assembly Drawing", "BOM Generation", "Engineering Standards (ISO/ASME)"],
        tools: ["AutoCAD Mechanical", "Autodesk Viewer", "Drafting Standards Library"],
        learningOutcomes: [
            "Precise 2D mechanical drafting conforming to ASME Y14.5 and ISO drawing standards",
            "Application of Geometric Dimensioning and Tolerancing (GD&T) feature control frames",
            "Sectional views, isometric projections, assembly details and exploded drawings",
            "Automated Bill of Materials (BOM) generation and dynamic block management",
            "Fabrication drawing preparation for sheet metal, castings, and machined components"
        ],
        modules: [
            "Module 1: AutoCAD Interface, Coordinate Systems & Precision Drawing Tools",
            "Module 2: Geometric Dimensioning & Tolerancing (GD&T) Foundations",
            "Module 3: Sectional Views, Detail Drafting & Mechanical Part Conventions",
            "Module 4: Assembly Drawings, Fit & Clearance Tolerances, BOM Schedules",
            "Module 5: Multi-Stage Industrial Gearbox 2D Drafting Package Capstone"
        ],
        internship: "Complete production-ready drafting package for a multi-stage industrial reduction gearbox including full assemblies and manufacturing prints.",
        targetAudience: "Mechanical Engineering Students, Diploma Holders, Draftsmen",
        careerRoles: "CAD Draftsman, Mechanical Design Technician, Production Planning Engineer"
    },
    {
        id: "me-002",
        name: "Computer-Aided Design (CAD)",
        title: "Computer-Aided Design (CAD)",
        category: "Mechanical Engineering",
        duration: 25,
        durationUnit: "Weeks",
        durationText: "25 Weeks",
        fee: 28799,
        formattedFee: "₹28,799",
        currency: "INR",
        badge: "Core Mechanical",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        description: "Comprehensive 3D parametric design: model complex mechanical components, multi-part assemblies, interference detection, and sheet metal fabrication.",
        overview: "Comprehensive 3D parametric design: model complex mechanical components, multi-part assemblies, interference detection, and sheet metal fabrication.",
        skills: ["3D Parametric CAD", "Part Modeling", "Assembly Kinematics", "Interference Detection", "Sheet Metal Design", "Drafting Conversion"],
        tools: ["AutoCAD", "SolidWorks / Fusion 360", "CAD Standards"],
        learningOutcomes: [
            "Parametric 3D solid feature modeling: extrusions, sweeps, lofts, cuts, fillets",
            "Bottom-up and top-down mechanical assembly modeling with mate constraints",
            "Kinematic motion check, dynamic clearance envelopes, and collision detection",
            "Sheet metal design rules: bend deductions, K-factors, flat pattern generation",
            "Converting 3D models into detailed, fabrication-ready 2D manufacturing drawings"
        ],
        modules: [
            "Module 1: Parametric 3D Solid Modeling & Sketch Constraints",
            "Module 2: Complex Feature Generation: Lofts, Sweeps & Helical Geometry",
            "Module 3: Multi-Component Assembly Constraints & Kinematic Mates",
            "Module 4: Sheet Metal Design, Weldments & Enclosure Fabrication",
            "Module 5: Industrial Robotic Arm Joint Assembly & CAD Package Capstone"
        ],
        internship: "Reverse engineering and complete 3D parametric CAD package for an industrial articulated robot arm joint assembly.",
        targetAudience: "Mechanical, Industrial & Production Engineering Students",
        careerRoles: "CAD Engineer, Mechanical Product Modeler, Mechanical Designer"
    },
    {
        id: "me-003",
        name: "CATIA Design & Modeling",
        title: "CATIA Design & Modeling",
        category: "Mechanical Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 24999,
        formattedFee: "₹24,999",
        currency: "INR",
        badge: "Aerospace & Auto",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        description: "Master CATIA V5/V6 for aerospace and high-end automotive engineering. Learn Part Design, Generative Shape Design (GSD), and DMU Kinematics.",
        overview: "Master CATIA V5/V6 for aerospace and high-end automotive engineering. Learn Part Design, Generative Shape Design (GSD), and DMU Kinematics.",
        skills: ["CATIA Part Design", "Generative Shape Design (GSD)", "Class-A Surfacing", "DMU Kinematics", "Assembly Design", "Drafting Workbench"],
        tools: ["Dassault CATIA V5/V6", "DMU Kinematics Simulator"],
        learningOutcomes: [
            "Part design workbench: boolean operations, solid functional design, draft analysis",
            "Generative shape design: wireframe geometry, complex splines, swept surfaces",
            "Class-A surfacing rules for aerodynamic exterior profiles",
            "DMU kinematics: creating rotational, prismatic joints, degrees of freedom check",
            "Industrial design verification and manufacturing tool design considerations"
        ],
        modules: [
            "Module 1: CATIA Architecture, Sketcher Workbench & Part Design Tools",
            "Module 2: Generative Shape Design (GSD) & Advanced Surface Modeling",
            "Module 3: Assembly Workbench, Contextual Design & Skeleton Modeling",
            "Module 4: Digital Mockup (DMU) Kinematic Simulation & Mechanism Studies",
            "Module 5: Aircraft Wing Flap & Actuation Mechanism Capstone"
        ],
        internship: "Designing an aerodynamic aircraft wing flap structure with internal ribbing, skin surfacing, and kinematic actuation mechanism.",
        targetAudience: "Aerospace & Mechanical Engineering Students, Product Stylists",
        careerRoles: "CATIA Design Engineer, BIW Designer, Aerospace Structures Modeler"
    },
    {
        id: "me-004",
        name: "SolidWorks Design & Simulation",
        title: "SolidWorks Design & Simulation",
        category: "Mechanical Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 24999,
        formattedFee: "₹24,999",
        currency: "INR",
        badge: "Product Design",
        image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80",
        description: "Master SolidWorks parametric solid modeling, weldments, mold design, coupled with Finite Element Analysis (FEA) structural simulations.",
        overview: "Master SolidWorks parametric solid modeling, weldments, mold design, coupled with Finite Element Analysis (FEA) structural simulations.",
        skills: ["SolidWorks 3D Modeling", "FEA Structural Analysis", "Von Mises Stress", "Factor of Safety Optimization", "Weldments & Sheet Metal", "Motion Study"],
        tools: ["SolidWorks", "SolidWorks Simulation", "SolidWorks Motion"],
        learningOutcomes: [
            "Complex parametric feature modeling, design tables, and configurations",
            "Weldment structures with custom profile structural members and cut lists",
            "Static linear structural simulation: applying fixtures, loads, gravity",
            "Meshing quality controls, singularity resolution, and factor of safety validation",
            "Dynamic motion analysis and export of animated kinematic simulation packages"
        ],
        modules: [
            "Module 1: SolidWorks Advanced Part Modeling & Configurations",
            "Module 2: Weldments, Structural Frames & Sheet Metal Fabrications",
            "Module 3: Complex Multi-Body Assemblies & Motion Studies",
            "Module 4: SolidWorks Simulation: Static Stress, Strain & Displacement FEA",
            "Module 5: Industrial Hydraulic Press Frame FEA Optimization Capstone"
        ],
        internship: "Complete structural FEA stress and fatigue simulation on an industrial hydraulic press frame to reduce weight by 18%.",
        targetAudience: "Mechanical Engineers, Machine Designers, Product Development Teams",
        careerRoles: "SolidWorks Designer, Mechanical Simulation Engineer, Product Development Engineer"
    },
    {
        id: "me-005",
        name: "ANSYS Engineering Simulation",
        title: "ANSYS Engineering Simulation",
        category: "Mechanical Engineering",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Advanced CAE",
        image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80",
        description: "High-end Computer-Aided Engineering (CAE): ANSYS Mechanical FEA, static structural, modal analysis, thermal dissipation, and Computational Fluid Dynamics (CFD).",
        overview: "High-end Computer-Aided Engineering (CAE): ANSYS Mechanical FEA, static structural, modal analysis, thermal dissipation, and Computational Fluid Dynamics (CFD).",
        skills: ["ANSYS Workbench", "Finite Element Analysis (FEA)", "Computational Fluid Dynamics (CFD)", "Meshing Quality & Inflation", "Modal Analysis", "Thermal Transfer"],
        tools: ["ANSYS Workbench", "ANSYS Mechanical", "ANSYS Fluent", "SpaceClaim"],
        learningOutcomes: [
            "Geometry cleanup and preparation using ANSYS SpaceClaim / DesignModeler",
            "Advanced meshing: hexahedral vs tetrahedral, boundary layer inflation, skewness check",
            "Static structural analysis: contact formulation, non-linear deformation, plasticity",
            "Vibration analysis: natural frequencies, harmonic response, resonant modes",
            "Fluid flow CFD analysis using ANSYS Fluent: turbulence models, pressure drop, heat exchange"
        ],
        modules: [
            "Module 1: ANSYS Workbench Overview & SpaceClaim CAD Geometry Prep",
            "Module 2: Advanced Finite Element Meshing & Mesh Convergence Studies",
            "Module 3: Structural Static, Modal & Harmonic Vibration Analysis",
            "Module 4: Computational Fluid Dynamics (CFD) with ANSYS Fluent",
            "Module 5: Aerodynamic Airfoil Drag & Heat Exchanger Simulation Capstone"
        ],
        internship: "Comprehensive aerodynamic drag CFD study and structural thermal stress analysis of an industrial shell-and-tube heat exchanger.",
        targetAudience: "Mechanical, Aerospace, Thermal & Chemical Engineers",
        careerRoles: "FEA Analyst, CFD Engineer, CAE Specialist, Structural Consultant"
    },
    {
        id: "me-006",
        name: "CNC Programming & Manufacturing",
        title: "CNC Programming & Manufacturing",
        category: "Mechanical Engineering",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 22499,
        formattedFee: "₹22,499",
        currency: "INR",
        badge: "Precision Shop",
        image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=600&q=80",
        description: "Master modern computer numerical control manufacturing: manual G-Code and M-Code programming, CNC milling, CNC turning, tool selection, and CAM simulation.",
        overview: "Master modern computer numerical control manufacturing: manual G-Code and M-Code programming, CNC milling, CNC turning, tool selection, and CAM simulation.",
        skills: ["G-Code & M-Code", "CNC Milling (VMC)", "CNC Lathe Turning", "CAM Programming", "Toolpath Optimization", "Cutter Compensation", "Metrology"],
        tools: ["Mastercam / Fusion CAM", "CNC Simulator", "Fanuc Controller Emulators"],
        learningOutcomes: [
            "Coordinate systems (G54-G59), tool offset calibration, work piece datum setting",
            "Writing manual G-code cycles: canned drilling, facing, pocketing, thread turning",
            "CAM toolpath generation, feeds/speeds calculations, tool wear compensation",
            "Verification of multi-axis toolpaths to prevent machine crashes and gouging",
            "Part inspection, Coordinate Measuring Machine (CMM) quality controls"
        ],
        modules: [
            "Module 1: CNC Machining Fundamentals & Machine Tool Architecture",
            "Module 2: Manual G-Code & M-Code Programming for Lathe & Milling",
            "Module 3: Fixed Canned Cycles, Subprograms & Coordinate Transformations",
            "Module 4: CAM Software Toolpath Generation, Post-Processing & Simulation",
            "Module 5: Aerospace Flange Component Multi-Axis Machining Capstone"
        ],
        internship: "Full CAM programming and simulated CNC production run of an aerospace flange component maintaining 10-micron dimensional tolerances.",
        targetAudience: "Mechanical & Manufacturing Diploma/Degree Holders, Machine Shop Engineers",
        careerRoles: "CNC Programmer, CAM Specialist, Machine Shop Supervisor, Manufacturing Engineer"
    },
    {
        id: "me-007",
        name: "3D Printing & Additive Manufacturing",
        title: "3D Printing & Additive Manufacturing",
        category: "Mechanical Engineering",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 22999,
        formattedFee: "₹22,999",
        currency: "INR",
        badge: "NextGen Tech",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        description: "Explore the modern frontier of additive manufacturing: FDM, SLA, and SLS technologies, slicing optimization, generative design, and rapid prototyping.",
        overview: "Explore the modern frontier of additive manufacturing: FDM, SLA, and SLS technologies, slicing optimization, generative design, and rapid prototyping.",
        skills: ["Additive Manufacturing Technologies", "FDM & SLA Slicing (Cura/Prusa)", "Design for Additive Manufacturing (DfAM)", "Topology Optimization", "Material Properties", "Post-Processing"],
        tools: ["Ultimaker Cura", "PrusaSlicer", "Fusion 360 Generative", "3D Printers"],
        learningOutcomes: [
            "Comprehensive comparison of FDM, SLA, SLS, and direct metal laser sintering (DMLS)",
            "Design for Additive Manufacturing (DfAM): overhangs, support strategies, infill patterns",
            "Slicing parameters: layer heights, print speeds, retraction, thermal bed adhesion",
            "Topology optimization and lattice structure generation for lightweighting",
            "Post-processing techniques: chemical vapor smoothing, curing, support removal"
        ],
        modules: [
            "Module 1: Additive Manufacturing History, Processes & Material Science",
            "Module 2: CAD Design for 3D Printing (DfAM) & File Repair (STL/OBJ)",
            "Module 3: Advanced Slicing Strategies, Infill Geometry & Thermal Settings",
            "Module 4: Topology Optimization, Weight Reduction & Lattice Infill",
            "Module 5: Customized Drone Chassis Rapid Prototyping Capstone"
        ],
        internship: "Design, slicing parameter optimization, and functional 3D printing of a lightweight carbon-fiber composite drone chassis.",
        targetAudience: "Product Designers, Mechanical Innovators, Prototyping Engineers",
        careerRoles: "Additive Manufacturing Engineer, Rapid Prototyping Specialist, 3D Print Lead"
    },
    {
        id: "me-008",
        name: "Industrial Automation & Robotics",
        title: "Industrial Automation & Robotics",
        category: "Mechanical Engineering",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Smart Factory",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
        description: "Automate modern factory floors: PLC ladder logic, SCADA supervision, pneumatics, sensor integration, and industrial articulated robotic arm programming.",
        overview: "Automate modern factory floors: PLC ladder logic, SCADA supervision, pneumatics, sensor integration, and industrial articulated robotic arm programming.",
        skills: ["PLC Programming (Siemens/Allen-Bradley)", "Ladder Logic", "SCADA Architecture", "Industrial Robotics (ABB/KUKA)", "Pneumatics & Hydraulics", "Sensor Interfacing"],
        tools: ["Siemens TIA Portal", "Rockwell RSLogix", "RoboDK", "Factory I/O"],
        learningOutcomes: [
            "PLC hardware architecture, digital/analog I/O wiring, and communication buses",
            "Writing complex PLC ladder logic routines: timers, counters, bit shift registers",
            "Human-Machine Interface (HMI) design and SCADA real-time supervision",
            "Pneumatic cylinder actuation circuits and electro-pneumatic valves",
            "Industrial robot offline simulation, teach pendant programming, pick-and-place trajectories"
        ],
        modules: [
            "Module 1: Industrial Automation Architecture, Sensors & Actuators",
            "Module 2: PLC Hardware Wiring & Ladder Logic Programming",
            "Module 3: SCADA Supervisory Systems & HMI Dashboard Design",
            "Module 4: Industrial Articulated Robots & Motion Trajectory Planning",
            "Module 5: Automated Sorting & Packaging Conveyor Cell Capstone"
        ],
        internship: "Designing and simulating a fully automated high-speed conveyor packaging cell with PLC logic and robotic palletizing arm.",
        targetAudience: "Mechanical, Mechatronics, Electrical & Automation Engineers",
        careerRoles: "Automation Engineer, PLC Programmer, Robotics Engineer, Control Systems Specialist"
    },
    {
        id: "me-009",
        name: "EV Technology for Mechanical Engineers",
        title: "EV Technology for Mechanical Engineers",
        category: "Mechanical Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 28499,
        formattedFee: "₹28,499",
        currency: "INR",
        badge: "Clean Mobility",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
        description: "Tailored EV engineering for mechanical disciplines: battery pack structural housing, liquid thermal cooling plates, powertrain mounts, and crashworthiness.",
        overview: "Tailored EV engineering for mechanical disciplines: battery pack structural housing, liquid thermal cooling plates, powertrain mounts, and crashworthiness.",
        skills: ["EV Battery Enclosure Design", "Battery Thermal Management (BTMS)", "Electric Motor Mechanical Mounts", "Crash Simulation (FEA)", "Lightweight Materials", "Powertrain Layout"],
        tools: ["SolidWorks", "ANSYS Thermal", "CAD Sheet Metal", "MATLAB"],
        learningOutcomes: [
            "Electric vehicle powertrain mechanical architecture and weight distribution",
            "Structural enclosure design for high-voltage battery packs meeting IP67 standards",
            "Liquid cooling plate channel design and thermal dissipation FEA simulation",
            "Electric motor structural mounts, vibration damping, and torque transmission",
            "Crash impact absorption, intrusion prevention, and international safety regulations"
        ],
        modules: [
            "Module 1: Electric Vehicle Mechanical Architecture & Powertrain Dynamics",
            "Module 2: High-Voltage Battery Pack Structural Enclosure Design",
            "Module 3: Battery Thermal Management Systems (BTMS) & Heat Transfer",
            "Module 4: Motor Mounts, Drive Shafts & Structural Vibration Isolation",
            "Module 5: EV Modular Battery Enclosure & Liquid Cooling Plate Capstone"
        ],
        internship: "Design and CFD thermal validation of an aluminum extruded battery pack enclosure with serpentine liquid cooling channels.",
        targetAudience: "Mechanical, Automotive & Materials Engineers pivoting to EV mobility",
        careerRoles: "EV Mechanical Design Engineer, Battery Structural Engineer, Thermal Management Lead"
    },
    {
        id: "me-010",
        name: "Manufacturing Process & Quality Control",
        title: "Manufacturing Process & Quality Control",
        category: "Mechanical Engineering",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 19999,
        formattedFee: "₹19,999",
        currency: "INR",
        badge: "Six Sigma",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        description: "Drive zero-defect manufacturing: Statistical Process Control (SPC), Six Sigma DMAIC, Lean manufacturing, root cause analysis, and metrology.",
        overview: "Drive zero-defect manufacturing: Statistical Process Control (SPC), Six Sigma DMAIC, Lean manufacturing, root cause analysis, and metrology.",
        skills: ["Statistical Process Control (SPC)", "Six Sigma DMAIC", "Quality Control Tools", "Root Cause Analysis (Fishbone/5-Why)", "Lean Manufacturing & 5S", "Metrology & CMM"],
        tools: ["Minitab", "Excel Statistical Tools", "Quality Management Portals"],
        learningOutcomes: [
            "Primary manufacturing processes: casting, forging, machining, stamping, injection molding",
            "Statistical process control: X-bar, R charts, process capability indices (Cp, Cpk)",
            "Six Sigma DMAIC methodology for systematic defect reduction in mass production",
            "Root cause investigation using Ishikawa fishbone diagrams and 5-Why analysis",
            "Precision metrology: verniers, micrometers, height gauges, optical comparators"
        ],
        modules: [
            "Module 1: Industrial Manufacturing Processes & Material Transformations",
            "Module 2: Metrology, Inspection Tools & GD&T Verification",
            "Module 3: Statistical Process Control (SPC) & Capability Indices (Cp/Cpk)",
            "Module 4: Six Sigma DMAIC Methodology, Kaizen & Lean Principles",
            "Module 5: Precision Machining Plant Quality Audit & Defect Reduction Capstone"
        ],
        internship: "Executing a Six Sigma DMAIC quality audit reducing dimensional scrap rates by 35% on an automotive gear machining line.",
        targetAudience: "Production, Industrial & Quality Control Engineers",
        careerRoles: "Quality Assurance Engineer, QC Inspector, Continuous Improvement Specialist, Lean Lead"
    },

    // -------------------------------------------------------------
    // CATEGORY 6: AUTOMOBILE ENGINEERING (10)
    // -------------------------------------------------------------
    {
        id: "ae-001",
        name: "Electric Vehicle (EV) Technology",
        title: "Electric Vehicle (EV) Technology",
        category: "Automobile Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 27999,
        formattedFee: "₹27,999",
        currency: "INR",
        badge: "Electric Mobility",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
        description: "Comprehensive electric mobility engineering: high-voltage architectures, BLDC & PMSM motors, traction inverters, regenerative braking, and chargers.",
        overview: "Comprehensive electric mobility engineering: high-voltage architectures, BLDC & PMSM motors, traction inverters, regenerative braking, and chargers.",
        skills: ["EV Powertrain Design", "PMSM & BLDC Traction Motors", "Motor Inverters", "Regenerative Braking", "High-Voltage Safety", "Charging Standards (CCS/CHAdeMO)"],
        tools: ["MATLAB / Simulink", "EV Powertrain Sizing Tools", "Simscape"],
        learningOutcomes: [
            "Electric vehicle drivetrain architecture: battery, inverter, motor, differential",
            "Motor physics: torque-speed curves, field-oriented control, efficiency maps",
            "Regenerative braking energy recovery algorithms and brake blending",
            "High-voltage vehicle wiring harnesses, interlocks, and safety disconnection relays",
            "EV charging station topologies: Level 1, Level 2 AC and Level 3 DC Fast Charging"
        ],
        modules: [
            "Module 1: Electric Vehicle Fundamentals & Commercial EV Architectures",
            "Module 2: Electric Traction Motors: Construction, Characteristics & Sizing",
            "Module 3: Power Electronics: Inverters, DC-DC Converters & Controllers",
            "Module 4: Vehicle Dynamics, Regenerative Braking & Range Estimation",
            "Module 5: Complete 2-Wheeler / 4-Wheeler EV Conversion Architecture Capstone"
        ],
        internship: "Full powertrain sizing and electrical schematic simulation for converting a conventional light commercial vehicle to pure electric drive.",
        targetAudience: "Automobile & Electrical Engineers, Mobility Professionals",
        careerRoles: "EV Systems Engineer, Powertrain Sizing Specialist, EV Calibration Engineer"
    },
    {
        id: "ae-002",
        name: "Automotive Design Using CATIA",
        title: "Automotive Design Using CATIA",
        category: "Automobile Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 27999,
        formattedFee: "₹27,999",
        currency: "INR",
        badge: "Automotive Styling",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
        description: "Industrial automotive design in CATIA V5: Body-in-White (BIW) design, aesthetic Class-A curvature, plastic interior trims, and packaging ergonomics.",
        overview: "Industrial automotive design in CATIA V5: Body-in-White (BIW) design, aesthetic Class-A curvature, plastic interior trims, and packaging ergonomics.",
        skills: ["Automotive Body-in-White (BIW)", "Class-A Surface Modeling", "Plastic Trim Design", "Packaging Studies", "Draft Angle Analysis", "Bumper & Fascia Design"],
        tools: ["Dassault CATIA V5", "Generative Shape Design", "Part Workbench"],
        learningOutcomes: [
            "Vehicle architecture and packaging envelopes conforming to SAE ergonomics",
            "Body-in-White structural panels: roof rails, pillars, floor pans, reinforcement beams",
            "Automotive exterior Class-A surface continuity (G0, G1, G2, G3)",
            "Injection molded automotive plastic parts: rib design, bosses, snap fits, dog houses",
            "Draft analysis for tooling release and mold separation constraints"
        ],
        modules: [
            "Module 1: Automotive Packaging Guidelines, Vehicle Ergonomics & SAE Standards",
            "Module 2: Body-in-White (BIW) Structural Component Modeling in CATIA",
            "Module 3: Class-A Exterior Body Panels & Aerodynamic Curvature Analysis",
            "Module 4: Automotive Interior Plastic Trims, Tooling Rules & Snap Fits",
            "Module 5: Complete Front Bumper Assembly with Grille & Fascia Capstone"
        ],
        internship: "Design of a modern automotive front bumper fascia and energy absorber conforming to pedestrian collision safety standards.",
        targetAudience: "Automobile Engineers, Industrial Designers, Mechanical Graduates",
        careerRoles: "BIW Design Engineer, Automotive Styling Modeler, Plastic Trim Specialist"
    },
    {
        id: "ae-003-30w",
        name: "Automotive CAD Using SolidWorks",
        title: "Automotive CAD Using SolidWorks (30 Weeks)",
        category: "Automobile Engineering",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 32999,
        formattedFee: "₹32,999",
        currency: "INR",
        badge: "Chassis & Dynamics",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
        description: "Comprehensive 30-week master track: model vehicle spaceframes, multi-link suspension kinematics, steering geometry, and structural chassis crash simulation.",
        overview: "Comprehensive 30-week master track: model vehicle spaceframes, multi-link suspension kinematics, steering geometry, and structural chassis crash simulation.",
        skills: ["Tubular Spaceframe Design", "Double-Wishbone Suspension", "Ackermann Steering Geometry", "Chassis Torsional Rigidity", "SolidWorks Motion", "FEA Crash Simulation"],
        tools: ["SolidWorks Premium", "SolidWorks Simulation", "SolidWorks Motion"],
        learningOutcomes: [
            "Vehicle spaceframe chassis parametric weldment modeling and triangulation",
            "Suspension kinematic design: camber gain, roll center, anti-dive, anti-squat",
            "Steering system geometry modeling adhering strictly to Ackermann principles",
            "Chassis torsional stiffness calculation and Finite Element FEA validation",
            "Dynamic suspension motion simulation and spring/damper rate optimization"
        ],
        modules: [
            "Module 1: Vehicle Tubular Spaceframe & Monocoque Chassis Architecture",
            "Module 2: Double Wishbone & Multi-Link Suspension Kinematic Modeling",
            "Module 3: Rack-and-Pinion Steering Mechanism & Ackermann Calibration",
            "Module 4: Dynamic Suspension Travel Simulation & Motion Studies",
            "Module 5: 30-Week Tubular Racecar Chassis & Suspension Assembly Capstone"
        ],
        internship: "Complete 30-week vehicle chassis and suspension assembly design with simulated rollover and frontal crash test validations.",
        targetAudience: "Automotive & Mechanical Engineers, Formula Student Teams",
        careerRoles: "Chassis Design Engineer, Automotive Systems Designer, Vehicle CAD Specialist"
    },
    {
        id: "ae-004-28w",
        name: "Automotive CAD Using SolidWorks",
        title: "Automotive CAD Using SolidWorks (28 Weeks)",
        category: "Automobile Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 27999,
        formattedFee: "₹27,999",
        currency: "INR",
        badge: "Component Modeling",
        image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
        description: "28-week core program focusing on automotive component modeling: brake calipers, ventilated rotors, engine mounts, transmission casings, and manufacturing prints.",
        overview: "28-week core program focusing on automotive component modeling: brake calipers, ventilated rotors, engine mounts, transmission casings, and manufacturing prints.",
        skills: ["Automotive Component 3D CAD", "Brake Rotor & Caliper Design", "Engine Bracket Mounts", "Transmission Housings", "Tolerance Stacks", "Manufacturing Drawings"],
        tools: ["SolidWorks", "SolidWorks Simulation", "Drafting Tools"],
        learningOutcomes: [
            "Parametric 3D solid modeling of heavy-duty powertrain and chassis components",
            "Ventilated disc brake assembly design and thermal expansion clearance",
            "Engine mounting brackets with rubber isolator vibration containment",
            "Transmission gearbox casing modeling with bearing bores and sealing grooves",
            "GD&T annotation and production-ready fabrication drawing generation"
        ],
        modules: [
            "Module 1: Automotive Part Modeling Conventions & Geometric Tolerances",
            "Module 2: Ventilated Brake Rotor, Caliper & Hydraulic Cylinder Modeling",
            "Module 3: Powertrain Mounting Brackets, Rubber Isolators & Bushings",
            "Module 4: Transmission Gearbox Housing & Shaft Support Geometry",
            "Module 5: High-Performance Disc Brake Assembly & Drawing Package Capstone"
        ],
        internship: "28-week production CAD package for a high-performance ventilated disc brake assembly with full mechanical drawings and BOM.",
        targetAudience: "Automotive Students, Mechanical Designers, Manufacturing Aspirants",
        careerRoles: "Automotive Component Designer, CAD Detailer, Mechanical Project Engineer"
    },
    {
        id: "ae-005",
        name: "Hybrid Vehicle Technology",
        title: "Hybrid Vehicle Technology",
        category: "Automobile Engineering",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 27999,
        formattedFee: "₹27,999",
        currency: "INR",
        badge: "Dual Powertrain",
        image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80",
        description: "Master modern hybrid vehicle powertrain architectures: Series, Parallel, Series-Parallel power split devices, energy management, and regenerative control.",
        overview: "Master modern hybrid vehicle powertrain architectures: Series, Parallel, Series-Parallel power split devices, energy management, and regenerative control.",
        skills: ["Hybrid Powertrain Architectures", "Power Split Planetary Devices", "Dual-Source Energy Management", "ICE & Motor Blending", "Regenerative Braking", "Hybrid Battery Packs"],
        tools: ["Simulink", "MATLAB", "Advisor Hybrid Simulation"],
        learningOutcomes: [
            "Architectural comparison: Micro-Hybrid, Mild (48V), Full HEV, Plug-in PHEV",
            "Planetary gear set power split device mechanics and speed-torque equations",
            "Real-time energy management control algorithms optimizing fuel economy",
            "Coordinated engine start/stop, electric-only drive, and engine-assist modes",
            "Hybrid battery pack charging state evaluation under real world drive cycles"
        ],
        modules: [
            "Module 1: Hybrid Vehicle Types & Commercial Powertrain Architectures",
            "Module 2: Planetary Gear Sets & Mechanical Power Split Systems",
            "Module 3: Energy Management Strategies & Mode Transition Control",
            "Module 4: 48V Mild Hybrid Architecture & BSG/ISG Integrated Starters",
            "Module 5: Series-Parallel Full Hybrid Drivetrain Simulation Capstone"
        ],
        internship: "Complete Simulink drive cycle simulation of a Series-Parallel hybrid powertrain demonstrating a 28% reduction in fuel consumption.",
        targetAudience: "Automotive & Mechanical Engineers, Powertrain Developers",
        careerRoles: "Hybrid Powertrain Engineer, Energy Management Specialist, Automotive Control Engineer"
    },
    {
        id: "ae-006",
        name: "Automotive Diagnostics & Troubleshooting",
        title: "Automotive Diagnostics & Troubleshooting",
        category: "Automobile Engineering",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 22999,
        formattedFee: "₹22,999",
        currency: "INR",
        badge: "ECU Diagnostics",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
        description: "Master modern electronic vehicle troubleshooting: OBD-II scanners, ECU Diagnostic Trouble Codes (DTC), CAN bus communication tracing, and sensor diagnostics.",
        overview: "Master modern electronic vehicle troubleshooting: OBD-II scanners, ECU Diagnostic Trouble Codes (DTC), CAN bus communication tracing, and sensor diagnostics.",
        skills: ["OBD-II Scanning", "Diagnostic Trouble Codes (DTC)", "CAN Bus Analysis", "Automotive Oscilloscopes", "Sensor Diagnostics (O2, MAF, Crank)", "Wiring Harness Tracing"],
        tools: ["OBD-II Diagnostic Tools", "Automotive Oscilloscope", "CAN Protocol Analyzers"],
        learningOutcomes: [
            "OBD-II modes of operation, freeze frame data, and readiness monitors",
            "Systematic troubleshooting of generic and manufacturer-specific DTC codes",
            "Controller Area Network (CAN) bus communication protocol analysis and sniffing",
            "Using digital storage oscilloscopes to diagnose sensor waveforms and jitter",
            "Troubleshooting automotive electrical circuits, relay modules, and grounding faults"
        ],
        modules: [
            "Module 1: Automotive Electronic Control Modules & Sensor Architectures",
            "Module 2: OBD-II Standard, Live Parameter Data & DTC Interpretation",
            "Module 3: Controller Area Network (CAN Bus) Diagnostics & Signal Decoding",
            "Module 4: Oscilloscope Waveform Analysis for Ignition, Injectors & Sensors",
            "Module 5: Multi-System Electronic Fault Isolation Diagnostic Capstone"
        ],
        internship: "Live diagnostic troubleshooting simulation solving complex multi-sensor communication faults and ECU intermittent misfire codes.",
        targetAudience: "Automotive Diploma/Degree Holders, Service Engineers, Fleet Technicians",
        careerRoles: "Automotive Diagnostic Engineer, ECU Calibration Technician, Field Service Specialist"
    },
    {
        id: "ae-007",
        name: "Battery Management System (BMS)",
        title: "Battery Management System (BMS)",
        category: "Automobile Engineering",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Critical EV Core",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
        description: "The core intelligence of every EV: cell voltage monitoring, passive/active cell balancing, State of Charge (SoC) Kalman filters, and thermal runaway prevention.",
        overview: "The core intelligence of every EV: cell voltage monitoring, passive/active cell balancing, State of Charge (SoC) Kalman filters, and thermal runaway prevention.",
        skills: ["BMS Hardware Architecture", "State of Charge (SoC) Estimation", "State of Health (SoH)", "Active & Passive Cell Balancing", "Thermal Runaway Protection", "CAN Communication"],
        tools: ["MATLAB / Simulink BMS Toolbox", "Simulink", "Hardware Circuit Simulators"],
        learningOutcomes: [
            "Lithium-ion cell chemistry, charge-discharge curves, and aging degradation",
            "Designing hardware for cell monitoring: AFE (Analog Front End) chips, isolation",
            "Implementing State of Charge (SoC) estimation using Extended Kalman Filters (EKF)",
            "Passive vs active cell balancing topologies and energy dissipation control",
            "Over-voltage, under-voltage, over-current, and thermal runaway safety cutoffs"
        ],
        modules: [
            "Module 1: Lithium-Ion Cell Electrochemistry & Battery Pack Sizing",
            "Module 2: BMS Architecture: Master/Slave Topologies & Analog Front Ends",
            "Module 3: SoC & SoH Algorithm Development with Extended Kalman Filters",
            "Module 4: Passive & Active Cell Balancing Circuits & Thermal Protection",
            "Module 5: Complete 400V EV Battery Management System Model Capstone"
        ],
        internship: "Developing a complete Simulink BMS model with active cell balancing, accurate EKF SoC prediction, and thermal safety cutoffs.",
        targetAudience: "Automobile, Electrical, Electronics & Embedded Engineers",
        careerRoles: "BMS Engineer, Battery Algorithm Developer, EV Electrical Architect"
    },
    {
        id: "ae-008",
        name: "Automotive Quality Control",
        title: "Automotive Quality Control",
        category: "Automobile Engineering",
        duration: 24,
        durationUnit: "Weeks",
        durationText: "24 Weeks",
        fee: 22999,
        formattedFee: "₹22,999",
        currency: "INR",
        badge: "IATF 16949",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
        description: "Master global automotive quality standards: IATF 16949, APQP, PPAP submissions, Design & Process FMEA risk evaluations, and MSA measurement studies.",
        overview: "Master global automotive quality standards: IATF 16949, APQP, PPAP submissions, Design & Process FMEA risk evaluations, and MSA measurement studies.",
        skills: ["IATF 16949 Standards", "APQP Framework", "PPAP Level 1-5 Submissions", "FMEA (DFMEA & PFMEA)", "Measurement System Analysis (MSA)", "Control Plans"],
        tools: ["Quality Systems Software", "FMEA Matrix Tools", "Minitab"],
        learningOutcomes: [
            "IATF 16949 quality management system requirements for automotive supply chains",
            "Advanced Product Quality Planning (APQP) 5-phase execution from concept to release",
            "Production Part Approval Process (PPAP) 18 documentation requirements",
            "Failure Mode & Effects Analysis (DFMEA & PFMEA) and Action Priority (AP) calculation",
            "Measurement System Analysis (MSA): Gage R&R studies for repeatability and reproducibility"
        ],
        modules: [
            "Module 1: IATF 16949 Standards & Automotive Core Tools Overview",
            "Module 2: Advanced Product Quality Planning (APQP) & Control Plan Development",
            "Module 3: Failure Mode & Effects Analysis (DFMEA & PFMEA Implementation)",
            "Module 4: Measurement System Analysis (MSA) & Statistical Process Control",
            "Module 5: Tier-1 Automotive Supplier Complete PPAP Package Capstone"
        ],
        internship: "Authoring a complete 18-element Level 3 PPAP documentation submission package for an automotive powertrain casting supplier.",
        targetAudience: "Automobile & Mechanical Engineers, Quality Assurance Technicians",
        careerRoles: "Automotive Quality Engineer, Supplier Quality Assurance (SQA) Engineer, APQP Coordinator"
    },
    {
        id: "ae-009",
        name: "Vehicle Dynamics & Simulation",
        title: "Vehicle Dynamics & Simulation",
        category: "Automobile Engineering",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 29999,
        formattedFee: "₹29,999",
        currency: "INR",
        badge: "Handling & Ride",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
        description: "Simulate and optimize vehicle cornering, ride comfort, and stability: Pacejka tire models, quarter-car/half-car bounce/pitch, understeer gradients, and roll stability.",
        overview: "Simulate and optimize vehicle cornering, ride comfort, and stability: Pacejka tire models, quarter-car/half-car bounce/pitch, understeer gradients, and roll stability.",
        skills: ["Vehicle Dynamics Modeling", "Pacejka 'Magic Formula' Tire Model", "Quarter-Car & Half-Car Ride Models", "Understeer / Oversteer Gradients", "Roll Center Dynamics", "MATLAB / CarSim"],
        tools: ["MATLAB", "Simulink", "Adams Car / CarSim"],
        learningOutcomes: [
            "Quarter-car suspension modeling: sprung/unsprung mass, natural frequencies, damping ratios",
            "Pacejka 'Magic Formula' tire models: lateral force, slip angle, self-aligning torque",
            "Steady-state cornering: understeer gradient, critical speed, neutral steer calibration",
            "Transient vehicle response, lane change stability, and anti-roll bar tuning",
            "Full 14-DOF multi-body vehicle simulation and passenger ride comfort optimization"
        ],
        modules: [
            "Module 1: Longitudinal Dynamics: Acceleration, Braking & Weight Transfer",
            "Module 2: Tire Mechanics & Lateral Force Modeling (Pacejka Formula)",
            "Module 3: Ride Dynamics: Quarter-Car, Half-Car Pitch & Bounce Simulation",
            "Module 4: Steady-State & Transient Cornering Handling Characteristics",
            "Module 5: Complete Vehicle Lap Time & Handling Simulator Capstone"
        ],
        internship: "Designing and simulating a full vehicle multi-body dynamics model optimizing suspension damping and anti-roll bar stiffness for high-speed stability.",
        targetAudience: "Automobile & Motorsports Engineers, Simulation Enthusiasts",
        careerRoles: "Vehicle Dynamics Engineer, Ride & Handling Specialist, Motorsports Engineer"
    },
    {
        id: "ae-010",
        name: "ADAS – Advanced Driver Assistance Systems",
        title: "ADAS – Advanced Driver Assistance Systems",
        category: "Automobile Engineering",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 32999,
        formattedFee: "₹32,999",
        currency: "INR",
        badge: "Autonomous Drive",
        image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
        description: "Engineer the future of autonomous mobility: Radar, Camera, and Lidar sensor fusion, computer vision for lane detection, AEB algorithms, and adaptive cruise control.",
        overview: "Engineer the future of autonomous mobility: Radar, Camera, and Lidar sensor fusion, computer vision for lane detection, AEB algorithms, and adaptive cruise control.",
        skills: ["Sensor Fusion (Radar/Lidar/Camera)", "Computer Vision (OpenCV)", "Adaptive Cruise Control (ACC)", "Autonomous Emergency Braking (AEB)", "Lane Keeping Assist (LKA)", "ROS 2"],
        tools: ["Python", "OpenCV", "MATLAB Automated Driving Toolbox", "ROS 2"],
        learningOutcomes: [
            "ADAS sensor suite physics: automotive radar, FMCW, Lidar point clouds, stereo cameras",
            "Object detection and lane departure warning algorithms using OpenCV and deep vision",
            "Multi-sensor fusion using Extended Kalman Filters for accurate target tracking",
            "Control loops for Adaptive Cruise Control (ACC) and Autonomous Emergency Braking (AEB)",
            "ISO 26262 functional safety requirements for automotive automated driving systems"
        ],
        modules: [
            "Module 1: ADAS Architecture, Levels of Autonomy & Automotive Safety Standards",
            "Module 2: Camera Computer Vision: Lane Detection, Traffic Sign Recognition",
            "Module 3: Radar & Lidar Point Cloud Processing & Target Fusion",
            "Module 4: Control Algorithms for Adaptive Cruise & Emergency Braking",
            "Module 5: Complete Autonomous Collision Avoidance Simulator Capstone"
        ],
        internship: "Developing an end-to-end simulated ADAS pipeline detecting pedestrians and initiating automatic emergency braking under adverse weather conditions.",
        targetAudience: "Automobile, Electronics, Computer Science & Embedded Engineers",
        careerRoles: "ADAS Algorithm Engineer, Sensor Fusion Specialist, Autonomous Driving Engineer"
    },

    // -------------------------------------------------------------
    // CATEGORY 7: ADVANCED TECHNOLOGY (8)
    // -------------------------------------------------------------
    {
        id: "at-001",
        name: "AI in Automotive Engineering",
        title: "AI in Automotive Engineering",
        category: "Advanced Technology",
        duration: 36,
        durationUnit: "Weeks",
        durationText: "36 Weeks",
        fee: 37999,
        formattedFee: "₹37,999",
        currency: "INR",
        badge: "Flagship Frontier",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
        description: "36-week flagship frontier program: train deep neural networks on automotive camera streams, edge AI deployment on NVIDIA Jetson, predictive maintenance, and reinforcement learning.",
        overview: "36-week flagship frontier program: train deep neural networks on automotive camera streams, edge AI deployment on NVIDIA Jetson, predictive maintenance, and reinforcement learning.",
        skills: ["Automotive Deep Learning", "Edge AI (NVIDIA Jetson)", "YOLO Object Detection", "Predictive Fleet Maintenance", "Reinforcement Learning", "TensorRT Optimization"],
        tools: ["Python", "PyTorch", "TensorRT", "OpenCV", "NVIDIA Jetson Simulator"],
        learningOutcomes: [
            "Training lightweight convolutional networks for real-time automotive vision",
            "Model acceleration using TensorRT and INT8 quantization for embedded automotive NPUs",
            "Predictive maintenance models forecasting transmission and battery anomalies from CAN telemetry",
            "Deep reinforcement learning for autonomous vehicle path planning and trajectory control",
            "Edge-to-cloud automotive fleet intelligence and OTA model deployment"
        ],
        modules: [
            "Module 1: Deep Learning Foundations & Automotive Computer Vision",
            "Module 2: High-Performance Edge Model Optimization (TensorRT & ONNX)",
            "Module 3: Vehicle CAN Telemetry Machine Learning for Predictive Maintenance",
            "Module 4: Reinforcement Learning for Autonomous Steering & Speed Control",
            "Module 5: Real-Time Edge AI In-Cabin Driver Monitoring & Exterior Detection Capstone"
        ],
        internship: "Deploying a real-time edge AI driver drowsiness and exterior blindspot detection model running at 30 FPS on embedded automotive hardware.",
        targetAudience: "Automotive, AI & Embedded Systems Engineers",
        careerRoles: "Automotive AI Specialist, Edge AI Engineer, Autonomous Driving Scientist"
    },
    {
        id: "at-002",
        name: "Robotics & Industrial Automation",
        title: "Robotics & Industrial Automation",
        category: "Advanced Technology",
        duration: 36,
        durationUnit: "Weeks",
        durationText: "36 Weeks",
        fee: 37999,
        formattedFee: "₹37,999",
        currency: "INR",
        badge: "Robotics 4.0",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
        description: "Master modern advanced robotics: Robot Operating System 2 (ROS 2), SLAM autonomous mobile robots, forward/inverse kinematics, and 6-axis manipulator control.",
        overview: "Master modern advanced robotics: Robot Operating System 2 (ROS 2), SLAM autonomous mobile robots, forward/inverse kinematics, and 6-axis manipulator control.",
        skills: ["ROS 2 (Robot Operating System)", "Autonomous Mobile Robots (AMRs)", "SLAM Navigation", "Kinematics & Dynamics", "MoveIt Motion Planning", "Gazebo Simulation"],
        tools: ["ROS 2", "Gazebo", "Python / C++", "MoveIt", "RViz"],
        learningOutcomes: [
            "ROS 2 nodes, topics, services, actions, custom message design",
            "Simultaneous Localization and Mapping (SLAM) for indoor autonomous navigation",
            "Forward and inverse kinematics for 6-degree-of-freedom robotic arms",
            "Trajectory planning, obstacle collision avoidance with MoveIt in Gazebo",
            "Integrating depth cameras, Lidar, and gripper actuators for factory manipulation"
        ],
        modules: [
            "Module 1: ROS 2 Architecture, Nodes, Topics & Hardware Abstraction",
            "Module 2: Mobile Robot Kinematics, Lidar SLAM & Autonomous Navigation",
            "Module 3: Robotic Arm Forward & Inverse Kinematics (DH Parameters)",
            "Module 4: MoveIt 2 Motion Planning, Collision Avoidance & Vision Pick-and-Place",
            "Module 5: Autonomous Warehouse Mobile Robot & Sorting Arm Capstone"
        ],
        internship: "Building an Autonomous Mobile Robot (AMR) in ROS 2 that navigates warehouse aisles, avoids dynamic obstacles, and coordinates with industrial arms.",
        targetAudience: "Mechatronics, Mechanical, Robotics & Computer Science Engineers",
        careerRoles: "Robotics Software Engineer, AMR Navigation Specialist, Automation Scientist"
    },
    {
        id: "at-003",
        name: "Digital Twin Technology",
        title: "Digital Twin Technology",
        category: "Advanced Technology",
        duration: 32,
        durationUnit: "Weeks",
        durationText: "32 Weeks",
        fee: 34999,
        formattedFee: "₹34,999",
        currency: "INR",
        badge: "Virtual Factory",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        description: "Bridge the physical and virtual worlds: connect real-time machine IoT telemetry to high-fidelity 3D digital twins for simulation, diagnostics, and predictive operations.",
        overview: "Bridge the physical and virtual worlds: connect real-time machine IoT telemetry to high-fidelity 3D digital twins for simulation, diagnostics, and predictive operations.",
        skills: ["Digital Twin Architecture", "IoT Telemetry Streaming (MQTT)", "3D Physical Simulation", "Unity / Unreal Industrial Visualization", "Predictive Maintenance", "Cloud Data Lake"],
        tools: ["Unity / Unreal Engine", "MQTT", "AWS IoT TwinMaker", "CAD Translators"],
        learningOutcomes: [
            "Digital twin taxonomy: component twins, asset twins, system twins, process twins",
            "Streaming real-time high-frequency sensor telemetry over MQTT and WebSockets",
            "Binding live physical sensor metrics directly to 3D CAD models in virtual engines",
            "Physics-based simulation estimating internal fatigue and thermal breakdown",
            "Creating immersive operator dashboards for predictive operational maintenance"
        ],
        modules: [
            "Module 1: Digital Twin Architecture & Cyber-Physical Systems Principles",
            "Module 2: Industrial Telemetry Ingestion (MQTT, OPC-UA & Cloud IoT)",
            "Module 3: 3D CAD Optimization & Real-Time Visualization Engines",
            "Module 4: Physics-Based Degradation Modeling & Anomaly Forecasting",
            "Module 5: Live Digital Twin of an Industrial Centrifugal Pump Capstone"
        ],
        internship: "Deploying a live digital twin of an industrial centrifugal pump streaming real-time vibration and temperature to predict bearing failure 48 hours in advance.",
        targetAudience: "Mechanical, Industrial, Mechatronics & Software Engineers",
        careerRoles: "Digital Twin Architect, Cyber-Physical Systems Engineer, Industrial Simulation Lead"
    },
    {
        id: "at-004",
        name: "IoT for Smart Manufacturing",
        title: "IoT for Smart Manufacturing",
        category: "Advanced Technology",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 31999,
        formattedFee: "₹31,999",
        currency: "INR",
        badge: "Connected Factory",
        image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80",
        description: "Connect shopfloor machinery to cloud analytics: ESP32 edge microcontrollers, industrial sensors, MQTT protocols, AWS IoT Core, and real-time alerts.",
        overview: "Connect shopfloor machinery to cloud analytics: ESP32 edge microcontrollers, industrial sensors, MQTT protocols, AWS IoT Core, and real-time alerts.",
        skills: ["Industrial IoT Architecture", "MQTT & CoAP Protocols", "ESP32 & Raspberry Pi", "Sensor Interfacing (Current/Vibration/Temp)", "AWS IoT Core", "Node-RED", "Time-Series Databases"],
        tools: ["ESP32", "Raspberry Pi", "AWS IoT Core", "Node-RED", "InfluxDB", "Grafana"],
        learningOutcomes: [
            "Hardware interfacing: 4-20mA current loops, RS485 Modbus, I2C, SPI sensors",
            "Edge compute data filtering and lightweight compression on ESP32/Raspberry Pi",
            "Secure MQTT communication with TLS certificates to AWS IoT Core broker",
            "Storing high-throughput industrial telemetry in InfluxDB time-series database",
            "Visualizing plant energy metrics and machine uptime dashboards in Grafana"
        ],
        modules: [
            "Module 1: Industrial IoT Hardware Platforms & Sensor Signal Conditioning",
            "Module 2: Industrial Communication Protocols: Modbus, MQTT & CoAP",
            "Module 3: Edge Computing, Local Processing & Security Encryption",
            "Module 4: Cloud Ingestion with AWS IoT Core & Time-Series Data Stores",
            "Module 5: Smart Factory Energy Monitoring & Machine Health IoT Capstone"
        ],
        internship: "Building an end-to-end industrial IoT mesh network monitoring factory power consumption and vibration metrics with live automated Telegram alerts.",
        targetAudience: "Electronics, Electrical, Mechanical & IoT Engineers",
        careerRoles: "Industrial IoT Engineer, Smart Factory Specialist, Connected Devices Architect"
    },
    {
        id: "at-005",
        name: "Industry 4.0 & Smart Factory",
        title: "Industry 4.0 & Smart Factory",
        category: "Advanced Technology",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 31999,
        formattedFee: "₹31,999",
        currency: "INR",
        badge: "NextGen Enterprise",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        description: "Drive digital factory transformation: integrate shopfloor PLCs with enterprise cloud systems via OPC-UA, Manufacturing Execution Systems (MES), and OEE optimization.",
        overview: "Drive digital factory transformation: integrate shopfloor PLCs with enterprise cloud systems via OPC-UA, Manufacturing Execution Systems (MES), and OEE optimization.",
        skills: ["Industry 4.0 Pillars", "OPC-UA Communication", "Manufacturing Execution Systems (MES)", "Overall Equipment Effectiveness (OEE)", "Cloud SCADA", "ERP Integration"],
        tools: ["OPC-UA Servers", "Ignition SCADA", "MES Platforms", "Python"],
        learningOutcomes: [
            "Comprehensive comprehension of the 9 pillars of Industry 4.0 transformation",
            "Implementing open industrial interoperability using the OPC-UA communication standard",
            "Tracking and maximizing Overall Equipment Effectiveness (OEE = Availability × Performance × Quality)",
            "Deploying Manufacturing Execution Systems (MES) to track production batches in real-time",
            "Closing the loop between shopfloor automation and enterprise SAP/ERP resource planning"
        ],
        modules: [
            "Module 1: Industry 4.0 Architectural Framework & Digital Transformation",
            "Module 2: Open Industrial Interoperability via OPC-UA Standard",
            "Module 3: Overall Equipment Effectiveness (OEE) Tracking & Optimization",
            "Module 4: Manufacturing Execution Systems (MES) & Cloud SCADA",
            "Module 5: Complete Smart Factory Operations Platform Capstone"
        ],
        internship: "Architecting an Industry 4.0 smart factory deployment integrating 8 machine PLCs via OPC-UA to compute live OEE metrics on an executive cloud portal.",
        targetAudience: "Industrial, Manufacturing, Production & Mechanical Engineers",
        careerRoles: "Industry 4.0 Consultant, Smart Factory Architect, Digital Manufacturing Lead"
    },
    {
        id: "at-006",
        name: "Python for Mechanical Engineers",
        title: "Python for Mechanical Engineers",
        category: "Advanced Technology",
        duration: 28,
        durationUnit: "Weeks",
        durationText: "28 Weeks",
        fee: 27999,
        formattedFee: "₹27,999",
        currency: "INR",
        badge: "Computational Tech",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
        description: "Supercharge mechanical engineering with Python: solve thermodynamics and fluid differential equations, automate CAD modeling via scripting, and process FEA logs.",
        overview: "Supercharge mechanical engineering with Python: solve thermodynamics and fluid differential equations, automate CAD modeling via scripting, and process FEA logs.",
        skills: ["Scientific Python (NumPy/SciPy)", "Engineering Mathematics Automation", "Thermodynamic Cycle Simulation", "CAD Scripting (FreeCAD/OpenCASCADE)", "FEA Data Processing", "Matplotlib Engineering Plots"],
        tools: ["Python", "Jupyter", "NumPy", "SciPy", "Matplotlib", "SymPy"],
        learningOutcomes: [
            "Numerical simulation of ODEs for spring-mass-damper and heat conduction systems",
            "Solving thermodynamic Rankine, Brayton and Otto cycles with Python libraries",
            "Automating repetitive geometric calculations and CAD parametric dimension generation",
            "Parsing extensive FEA simulation output files and extracting stress concentrations",
            "Constructing interactive engineering calculator dashboards with Streamlit"
        ],
        modules: [
            "Module 1: Scientific Python Essentials: NumPy Vectorization & Array Math",
            "Module 2: Numerical Solutions for Ordinary Differential Equations in Mechanics",
            "Module 3: Thermodynamics & Fluid Dynamics Computational Algorithms",
            "Module 4: Automated CAD Scripting & FEA Log Data Extraction",
            "Module 5: Interactive Internal Combustion Engine Thermodynamic Solver Capstone"
        ],
        internship: "Building an automated thermodynamic optimization tool simulating Otto cycle engine heat losses and generating optimal compression ratio curves.",
        targetAudience: "Mechanical, Thermal, Automobile & Production Engineers",
        careerRoles: "Computational Mechanical Engineer, CAE Automation Specialist, Engineering Software Associate"
    },
    {
        id: "at-007",
        name: "MATLAB & Simulink for Automotive Applications",
        title: "MATLAB & Simulink for Automotive Applications",
        category: "Advanced Technology",
        duration: 30,
        durationUnit: "Weeks",
        durationText: "30 Weeks",
        fee: 31999,
        formattedFee: "₹31,999",
        currency: "INR",
        badge: "Model-Based Design",
        image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80",
        description: "Master industry-standard Model-Based Design (MBD): closed-loop vehicle control algorithms, Stateflow logic, automatic embedded C-code generation, and MIL/SIL testing.",
        overview: "Master industry-standard Model-Based Design (MBD): closed-loop vehicle control algorithms, Stateflow logic, automatic embedded C-code generation, and MIL/SIL testing.",
        skills: ["MATLAB / Simulink", "Model-Based Design (MBD)", "Stateflow Logic", "Embedded Coder (Auto C-Code)", "MIL / SIL Testing", "PID Controller Tuning", "Powertrain Blockset"],
        tools: ["MATLAB", "Simulink", "Stateflow", "Embedded Coder"],
        learningOutcomes: [
            "Model-Based Design workflow conforming to automotive V-model development",
            "Modeling continuous physical vehicle powertrain dynamics in Simulink",
            "Designing finite-state supervisory machines and fault handlers with Stateflow",
            "Tuning closed-loop PID and feedforward controllers for automotive throttle/brake",
            "Automatic production ANSI C-code generation with Embedded Coder and MISRA compliance"
        ],
        modules: [
            "Module 1: MATLAB Advanced Scripting & Simulink Block Architecture",
            "Module 2: Model-Based Design (MBD) Workflow & Powertrain Simulation",
            "Module 3: Stateflow Finite State Machine Logic for Automotive Control",
            "Module 4: Model-in-the-Loop (MIL) & Software-in-the-Loop (SIL) Validation",
            "Module 5: Production Cruise Control & Electronic Throttle System Capstone"
        ],
        internship: "Designing an automotive adaptive cruise controller in Simulink with Stateflow safety states and verified automatic C-code generation.",
        targetAudience: "Automotive, Electrical, Electronics & Control Systems Engineers",
        careerRoles: "MBD Engineer, Simulink Control Systems Specialist, Automotive Embedded Engineer"
    },
    {
        id: "at-008",
        name: "EV Battery Analytics",
        title: "EV Battery Analytics",
        category: "Advanced Technology",
        duration: 32,
        durationUnit: "Weeks",
        durationText: "32 Weeks",
        fee: 34999,
        formattedFee: "₹34,999",
        currency: "INR",
        badge: "Battery AI",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
        description: "Machine learning for electric vehicle fleets: predict Remaining Useful Life (RUL), model electrochemical battery degradation, and analyze thermal health from telemetry.",
        overview: "Machine learning for electric vehicle fleets: predict Remaining Useful Life (RUL), model electrochemical battery degradation, and analyze thermal health from telemetry.",
        skills: ["Battery Degradation Modeling", "Remaining Useful Life (RUL) Prediction", "EV Fleet Telemetry Analytics", "Electrochemical Impedance Analysis", "Time-Series Machine Learning", "Python & BigQuery"],
        tools: ["Python", "Pandas", "Scikit-Learn", "XGBoost", "Streamlit", "BigQuery"],
        learningOutcomes: [
            "Lithium-ion degradation physics: SEI layer growth, lithium plating, capacity fade",
            "Processing raw fleet BMS telemetry: voltage relaxation, internal resistance spikes",
            "Machine learning models predicting Remaining Useful Life (RUL) with high accuracy",
            "Detecting micro-short circuits and early signs of thermal runaway risk",
            "Building cloud analytics dashboards tracking battery degradation across commercial fleets"
        ],
        modules: [
            "Module 1: EV Battery Degradation Chemistry & Fleet Telemetry Data Ingestion",
            "Module 2: Feature Engineering from Charging & Discharging Cycle Profiles",
            "Module 3: Machine Learning Models for Battery Remaining Useful Life (RUL)",
            "Module 4: Thermal Risk Early Warning Systems & Anomaly Detection",
            "Module 5: Commercial EV Fleet Battery Health Monitoring Platform Capstone"
        ],
        internship: "Building an enterprise analytics dashboard analyzing simulated telemetry from 1,000 EV delivery vans to forecast battery warranty risks.",
        targetAudience: "Data Scientists, EV Engineers, Fleet Managers, Battery Researchers",
        careerRoles: "EV Battery Data Analyst, Battery Intelligence Engineer, Fleet Analytics Specialist"
    }
];

// =========================================================================
// FAQ DATA
// =========================================================================
const FAQ_DATA = [
    {
        q: "What makes Nextgen DMA Ventures different from other academies?",
        a: "We focus 100% on live practical projects guided by senior industry mentors working in top Bangalore tech and engineering companies. You write real production code and build validated engineering models, not just watch recordings."
    },
    {
        q: "Do I need a prior technical background to enroll in these programs?",
        a: "Our programs are structured from foundational concepts to advanced production execution. Whether you are a fresh engineering graduate, non-CS student, or working professional, our dedicated mentors will guide your learning progression."
    },
    {
        q: "Are the classes conducted in offline Bangalore campus or online?",
        a: "We offer both! You can attend in-person hands-on training at our state-of-the-art HSR Layout campus in Bangalore with high-speed fiber labs, or join live interactive online sessions with recorded reviews."
    },
    {
        q: "What is the duration of the courses?",
        a: "Course durations range from 20 Weeks for focused skill development (e.g., Python, Digital Marketing) to 28-36 Weeks for comprehensive engineering and advanced technology master tracks."
    },
    {
        q: "What is the official course fee and payment structure?",
        a: "Official course fees are clearly listed for each program (ranging from ₹18,999 to ₹37,999). For detailed payment options, contact our admissions counselling team."
    },
    {
        q: "Do your programs include an internship and practical capstone?",
        a: "Yes! Every single program includes an intensive practical capstone project and verified internship module resulting in demonstrable portfolio code, CAD packages, or working simulations."
    },
    {
        q: "Will I receive an industry-recognized certificate upon completion?",
        a: "Yes, you will receive an official Course & Internship Completion Certificate from NextGen DMA Ventures Bangalore along with credential verification links for your resume and LinkedIn profile."
    },
    {
        q: "How do I apply or book a counselling session?",
        a: "Click 'Apply Now' on any course card or in the course details view, or contact our admissions desk at admissions@nextgendma.com or call +91 9787076296."
    }
];

// =========================================================================
// APPLICATION STATE MANAGEMENT
// =========================================================================
let currentTab = 'home';
let currentCategoryFilter = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    navigateToTab('home');
    renderFeaturedCourses();
    renderAllCoursesGrid();
    renderFaqs();
    populateFormCourseDropdown();

    // Ensure hero video autoplays smoothly
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.play().catch(() => {
            // Handled when user interacts
        });
    }

    // Subtle scroll-reveal animation for glassmorphism cards
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.course-tile, .service-alternating-row, .method-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    }
});

// Navigation Functions
function navigateToTab(tabId) {
    currentTab = tabId;

    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });

    const targetSection = document.getElementById(`tab-${tabId}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Fixed white header: active = mint active indicator bar + background pill
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.style.color = '#000000';
    });
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

function filterCategoryAndSwitch(category) {
    navigateToTab('courses');
    setCategoryFilter(category);
}

function setCategoryFilter(category) {
    currentCategoryFilter = category;
    
    document.querySelectorAll('.cat-pill').forEach(pill => {
        if (pill.getAttribute('data-cat') === category) {
            pill.classList.add('active-cat');
        } else {
            pill.classList.remove('active-cat');
        }
    });

    filterCourses();
}

function filterCourses() {
    const searchInput = document.getElementById('course-search-input');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const durationFilter = document.getElementById('duration-filter');
    const durationQuery = durationFilter ? durationFilter.value : 'all';
    const sortFilter = document.getElementById('sort-filter');
    const sortQuery = sortFilter ? sortFilter.value : 'default';

    let filtered = COURSES_DATA.filter(course => {
        // Category check
        const matchesCat = (currentCategoryFilter === 'all') || (course.category === currentCategoryFilter);
        
        // Duration filter check (Weeks)
        let matchesDuration = true;
        if (durationQuery === 'lt24') {
            matchesDuration = course.duration < 24;
        } else if (durationQuery === '24-26') {
            matchesDuration = course.duration >= 24 && course.duration <= 26;
        } else if (durationQuery === '28-30') {
            matchesDuration = course.duration >= 28 && course.duration <= 30;
        } else if (durationQuery === 'gt30') {
            matchesDuration = course.duration > 30;
        }

        // Search check
        const matchesSearch = !searchQuery || 
                              course.name.toLowerCase().includes(searchQuery) || 
                              (course.title && course.title.toLowerCase().includes(searchQuery)) ||
                              course.category.toLowerCase().includes(searchQuery) ||
                              course.overview.toLowerCase().includes(searchQuery) ||
                              (course.careerRoles && course.careerRoles.toLowerCase().includes(searchQuery)) ||
                              course.skills.some(s => s.toLowerCase().includes(searchQuery));

        return matchesCat && matchesDuration && matchesSearch;
    });

    // Sorting
    if (sortQuery === 'fee-asc') {
        filtered.sort((a, b) => a.fee - b.fee);
    } else if (sortQuery === 'fee-desc') {
        filtered.sort((a, b) => b.fee - a.fee);
    } else if (sortQuery === 'duration-asc') {
        filtered.sort((a, b) => a.duration - b.duration);
    } else if (sortQuery === 'duration-desc') {
        filtered.sort((a, b) => b.duration - a.duration);
    } else if (sortQuery === 'title-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderCoursesList(filtered, 'all-courses-grid');

    // Update live counts
    const countEl = document.getElementById('courses-count');
    const totalEl = document.getElementById('courses-total');
    if (countEl) countEl.textContent = filtered.length;
    if (totalEl) totalEl.textContent = COURSES_DATA.length;

    const noResults = document.getElementById('no-courses-found');
    if (noResults) {
        if (filtered.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    }
}

function resetFilters() {
    const searchInput = document.getElementById('course-search-input');
    if (searchInput) searchInput.value = '';
    const durationFilter = document.getElementById('duration-filter');
    if (durationFilter) durationFilter.value = 'all';
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) sortFilter.value = 'default';
    setCategoryFilter('all');
}

// =========================================================================
// RENDERING FUNCTIONS
// =========================================================================

function createCourseCardHTML(course) {
    const primaryRole = course.careerRoles ? course.careerRoles.split(',')[0].trim() : 'Specialist';
    const skillsList = course.skills || course.tools || [];
    
    return `
      <article class="course-tile group">
        <div class="course-media">
          <img src="${course.image}" alt="${course.name}" loading="lazy">
          <span class="course-index">${course.badge} &bull; ${course.durationText}</span>
        </div>
        <div class="course-body">
          <span class="course-domain">${course.category}</span>
          <h3 class="font-display">${course.name}</h3>
          
          <div class="course-meta">
            <span><i class="fa-regular fa-clock text-mint"></i> ${course.durationText}</span>
            <span><i class="fa-solid fa-graduation-cap text-mint"></i> Internship Incl.</span>
          </div>

          <p class="course-overview">${course.overview}</p>
          
          <p class="course-career">
            <i class="fa-solid fa-briefcase text-mint"></i>
            <span><strong>Target Role:</strong> ${primaryRole}</span>
          </p>

          <!-- Skills tags -->
          <div>
            <div class="course-tools-label">Key Competencies</div>
            <div class="course-tools">
              ${skillsList.slice(0, 4).map(skill => `<span>${skill}</span>`).join('')}
              ${skillsList.length > 4 ? `<span>+${skillsList.length - 4} more</span>` : ''}
            </div>
          </div>

          <!-- Highly Visible Fee Display -->
          <div class="course-pricing-row">
            <div>
              <div class="course-price-label">Total Course Fee</div>
              <div class="course-price-amount">${course.formattedFee}</div>
            </div>
            <div class="course-duration-badge">
              <i class="fa-regular fa-calendar-check text-mint"></i>
              <span>${course.durationText}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="course-actions">
          <button onclick="openCourseModal('${course.id}')" aria-label="View Details for ${course.name}">
            <span>View Details</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
          <button onclick="openBookingModal('${course.id}', 'advance')" aria-label="Book Slot for ${course.name}">
            <span>Book Slot (₹2,499)</span> <i class="fa-solid fa-ticket text-[10px]"></i>
          </button>
        </div>
      </article>`;
}

function renderFeaturedCourses() {
    const container = document.getElementById('featured-courses-container');
    if (!container) return;
    // Featured selection: AI, Web, Cyber, SolidWorks, EV Tech, AI in Auto
    const featuredIds = ["ai-001", "sd-001", "si-001", "me-004", "ae-001", "at-001"];
    const featured = COURSES_DATA.filter(c => featuredIds.includes(c.id));
    container.innerHTML = featured.map(c => createCourseCardHTML(c)).join('');
}

function renderAllCoursesGrid() {
    renderCoursesList(COURSES_DATA, 'all-courses-grid');
    const countEl = document.getElementById('courses-count');
    const totalEl = document.getElementById('courses-total');
    if (countEl) countEl.textContent = COURSES_DATA.length;
    if (totalEl) totalEl.textContent = COURSES_DATA.length;
}

function renderCoursesList(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = list.map(c => createCourseCardHTML(c)).join('');
}

function renderFaqs() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    container.innerHTML = FAQ_DATA.map((faq, index) => `
        <div class="faq-item">
            <button onclick="toggleFaq(${index})" class="faq-question">
                <span>${faq.q}</span>
                <i class="fa-solid fa-chevron-down text-xs transition-transform duration-200" id="faq-icon-${index}" style="color:#65D2C5;flex-shrink:0;margin-left:14px;"></i>
            </button>
            <div id="faq-answer-${index}" class="hidden faq-answer">
                <p style="padding-top:14px;">${faq.a}</p>
            </div>
        </div>
    `).join('');
}

function toggleFaq(index) {
    const answer = document.getElementById(`faq-answer-${index}`);
    const icon = document.getElementById(`faq-icon-${index}`);

    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        answer.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

function populateFormCourseDropdown() {
    const select = document.getElementById('form-course');
    if (!select) return;

    // Reset dropdown options keeping placeholder
    select.innerHTML = '<option value="">Select a Course / Program...</option>';

    COURSES_DATA.forEach(course => {
        const opt = document.createElement('option');
        opt.value = course.name;
        opt.setAttribute('data-fee', course.formattedFee);
        opt.setAttribute('data-duration', course.durationText);
        opt.setAttribute('data-id', course.id);
        opt.textContent = `${course.name} — ${course.formattedFee} (${course.durationText})`;
        select.appendChild(opt);
    });

    // Listen to dropdown changes to automatically update the course fee display
    select.addEventListener('change', () => {
        const selectedCourseName = select.value;
        const matched = COURSES_DATA.find(c => c.name === selectedCourseName || c.title === selectedCourseName);
        const feeInput = document.getElementById('form-fee');
        if (feeInput) {
            feeInput.value = matched ? `${matched.formattedFee} (${matched.durationText})` : '';
        }
    });
}

// =========================================================================
// VIEW DETAILS — DYNAMIC COURSE DETAILS MODAL
// =========================================================================

function openCourseModal(courseId) {
    const course = COURSES_DATA.find(c => c.id === courseId);
    if (!course) return;

    const modalHolder = document.getElementById('modal-content-container');
    const encodedCourse = encodeURIComponent(course.name);
    const waLink = `https://wa.me/919787076296?text=Hi%20Nextgen%20DNA,%20I%20want%20to%20enquire%20about%20the%20${encodedCourse}%20course%20(${course.durationText},%20Fee:%20${encodeURIComponent(course.formattedFee)}).`;

    const skillsList = course.skills || course.tools || [];
    const outcomesList = course.learningOutcomes || course.modules || [];
    const advanceFee = 2499;
    const remainingBalance = course.fee - advanceFee;

    modalHolder.innerHTML = `
        <!-- Hero Header -->
        <div class="relative h-64 sm:h-72 overflow-hidden border-b border-white/10">
            <img src="${course.image}" alt="${course.name}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            <div class="absolute bottom-5 left-6 right-6 text-white">
                <span class="px-3 py-1 bg-black/80 backdrop-blur-md text-[#65D2C5] border border-[#65D2C5]/40 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider">
                    ${course.category}
                </span>
                <h2 class="font-display text-3xl sm:text-4xl uppercase text-white mt-2 leading-none">${course.name}</h2>
                <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 mt-2">
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-clock text-[#65D2C5]"></i> ${course.durationText} Total Duration</span>
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-briefcase text-[#65D2C5]"></i> Real Production Capstone</span>
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-certificate text-[#65D2C5]"></i> Bangalore Industry Certified</span>
                </div>
            </div>
        </div>

        <div class="p-6 sm:p-8 space-y-6 text-white">
            
            <!-- PROMINENT BOOK YOUR SLOT SECTION (FIXED ADVANCE ₹2,499 VS FULL PAYMENT) -->
            <div class="p-6 rounded-2xl bg-gradient-to-br from-[#172126] to-[#0a0f12] border-2 border-[#65D2C5] shadow-2xl space-y-4 relative overflow-hidden">
                <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#65D2C5]/10 filter blur-2xl pointer-events-none"></div>

                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#65D2C5] animate-ping"></span>
                        <span class="font-mono text-xs uppercase font-extrabold text-[#65D2C5] tracking-widest">
                            Admissions Open &bull; Instant Slot Reservation
                        </span>
                    </div>
                    <span class="px-3 py-1 bg-[#65D2C5] text-black font-mono font-black text-xs uppercase rounded-full tracking-wider shadow">
                        Fixed Advance: ₹2,499
                    </span>
                </div>

                <div>
                    <h3 class="font-display text-3xl sm:text-4xl uppercase text-white tracking-wide">
                        Book Your Slot &ndash; <span class="text-[#65D2C5]">₹2,499</span>
                    </h3>
                    <p class="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                        Reserve your course registration slot by paying ₹2,499 and confirm your admission process.
                    </p>
                </div>

                <!-- Two Payment Options Comparison Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                    
                    <!-- 1. Pay Advance – ₹2,499 -->
                    <div class="p-4 rounded-xl bg-white/5 border border-[#65D2C5]/60 flex flex-col justify-between hover:bg-white/10 transition group">
                        <div>
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[10px] text-[#65D2C5] uppercase font-bold tracking-wider">Option 1: Slot Reservation</span>
                                <span class="w-2 h-2 rounded-full bg-[#65D2C5]"></span>
                            </div>
                            <div class="text-2xl font-display text-white mt-1.5 font-bold">
                                Pay Advance &ndash; <span class="text-[#65D2C5]">₹2,499</span>
                            </div>
                            <p class="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                                Pay ₹2,499 to reserve the course slot. This amount will be adjusted against the total course fee.
                            </p>
                            <div class="mt-3 pt-2.5 border-t border-white/10 font-mono text-[11px] text-amber-300 flex items-center justify-between">
                                <span>Remaining Balance:</span>
                                <strong>₹${remainingBalance.toLocaleString('en-IN')}</strong>
                            </div>
                            <div class="text-[10px] text-slate-400 font-mono mt-1">Status: Advance Paid &ndash; Slot Reserved</div>
                        </div>
                        <button onclick="openBookingModal('${course.id}', 'advance')" class="mt-4 w-full py-3 bg-[#65D2C5] hover:bg-[#8ae2d8] text-black font-mono font-bold text-xs uppercase rounded-lg transition shadow-lg shadow-[#65D2C5]/20 flex items-center justify-center gap-2">
                            <i class="fa-solid fa-ticket text-xs"></i>
                            <span>Reserve Slot For ₹2,499</span>
                        </button>
                    </div>

                    <!-- 2. Pay Full Course Fee -->
                    <div class="p-4 rounded-xl bg-white/5 border border-white/20 flex flex-col justify-between hover:border-[#65D2C5]/40 transition group">
                        <div>
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-[10px] text-slate-400 uppercase font-bold tracking-wider">Option 2: 100% Cleared</span>
                                <span class="w-2 h-2 rounded-full bg-slate-500"></span>
                            </div>
                            <div class="text-2xl font-display text-white mt-1.5 font-bold">
                                Pay Full Fee &ndash; <span class="text-white">${course.formattedFee}</span>
                            </div>
                            <p class="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                                Pay the entire course fee in one single transaction. Zero remaining balance.
                            </p>
                            <div class="mt-3 pt-2.5 border-t border-white/10 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                                <span>Remaining Balance:</span>
                                <strong>₹0 (Fully Paid)</strong>
                            </div>
                            <div class="text-[10px] text-slate-400 font-mono mt-1">Status: Fully Paid (Zero Balance)</div>
                        </div>
                        <button onclick="openBookingModal('${course.id}', 'full')" class="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 border border-[#65D2C5]/40 text-white hover:text-[#65D2C5] font-mono font-bold text-xs uppercase rounded-lg transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-credit-card text-xs"></i>
                            <span>Pay Full Course Fee</span>
                        </button>
                    </div>

                </div>
            </div>

            <!-- OFFICIAL FEE DETAILS BREAKDOWN SECTION -->
            <div class="p-5 rounded-2xl bg-black/80 border border-[#65D2C5]/40 backdrop-blur-md shadow-xl">
                <div class="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
                    <div>
                        <div class="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Total Official Course Fee</div>
                        <div class="text-3xl sm:text-4xl font-display text-white mt-1 tracking-wide">
                            <span class="text-[#65D2C5]">${course.formattedFee}</span>
                            <span class="text-xs font-mono text-slate-400 ml-1">INR (Official Fee)</span>
                        </div>
                    </div>
                    <div class="text-left sm:text-right">
                        <div class="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Program Duration</div>
                        <div class="text-xl font-mono font-bold text-white mt-1 flex items-center sm:justify-end gap-2">
                            <i class="fa-regular fa-calendar-check text-[#65D2C5]"></i>
                            <span>${course.durationText} (${course.duration} Weeks)</span>
                        </div>
                    </div>
                </div>
                <div class="pt-3 text-xs text-slate-300 font-mono flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-info text-[#65D2C5] mt-0.5"></i>
                    <div>
                        <strong class="text-white">Payment Information:</strong> Contact our admissions team for payment options or pay online via Razorpay.
                    </div>
                </div>
            </div>

            <!-- Course Overview -->
            <div>
                <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-[#65D2C5] mb-2 flex items-center gap-2">
                    <i class="fa-solid fa-book-open"></i> Course Overview
                </h3>
                <p class="text-slate-300 text-sm leading-relaxed">${course.overview}</p>
            </div>

            <!-- Skills Covered -->
            <div>
                <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-[#65D2C5] mb-2.5 flex items-center gap-2">
                    <i class="fa-solid fa-wrench"></i> Skills &amp; Technologies Covered
                </h3>
                <div class="flex flex-wrap gap-2">
                    ${skillsList.map(skill => `<span class="bg-white/10 border border-[#65D2C5]/30 text-[#65D2C5] font-mono text-xs font-semibold px-3 py-1.5 rounded-lg">${skill}</span>`).join('')}
                </div>
            </div>

            <!-- Learning Outcomes -->
            <div>
                <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-[#65D2C5] mb-2.5 flex items-center gap-2">
                    <i class="fa-solid fa-list-check"></i> Key Learning Outcomes
                </h3>
                <div class="space-y-2">
                    ${outcomesList.map(outcome => `
                        <div class="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-start gap-3">
                            <div class="w-5 h-5 rounded-full bg-[#65D2C5]/20 text-[#65D2C5] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#65D2C5]/40">✓</div>
                            <span class="text-xs font-medium text-slate-200 leading-relaxed">${outcome}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Internship Information -->
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-[#65D2C5] mb-1.5 flex items-center gap-2">
                    <i class="fa-solid fa-building-columns"></i> Internship &amp; Practical Capstone
                </h3>
                <p class="text-xs text-slate-300 leading-relaxed">${course.internship}</p>
                <div class="mt-2 text-[11px] font-mono text-slate-400">
                    <strong class="text-[#65D2C5]">Deliverables:</strong> GitHub / CAD Repo, Code Review Signoff, Official Industry Internship Certificate.
                </div>
            </div>

            <!-- Target Roles & Audience -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                    <span class="font-mono font-bold text-[#65D2C5] block mb-1">
                        <i class="fa-solid fa-users mr-1"></i> Target Audience:
                    </span>
                    <span class="text-slate-300 leading-relaxed">${course.targetAudience}</span>
                </div>
                <div>
                    <span class="font-mono font-bold text-[#65D2C5] block mb-1">
                        <i class="fa-solid fa-briefcase mr-1"></i> Career Pathways:
                    </span>
                    <span class="text-slate-300 leading-relaxed">${course.careerRoles}</span>
                </div>
            </div>

            <!-- Action Buttons: Direct Booking, General Enquiry & WhatsApp -->
            <div class="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button onclick="openBookingModal('${course.id}', 'advance')" class="flex-1 py-3.5 bg-[#65D2C5] hover:bg-[#8ae2d8] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-full transition shadow-lg shadow-[#65D2C5]/20 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-bolt"></i> Book Slot Now (₹2,499)
                </button>
                <button onclick="applyForCourse('${course.id}')" class="py-3.5 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-paper-plane text-xs"></i> General Enquiry
                </button>
                <a href="${waLink}" target="_blank" class="py-3.5 px-6 bg-white/10 hover:bg-white/20 border border-[#65D2C5]/40 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center gap-2">
                    <i class="fa-brands fa-whatsapp text-[#65D2C5] text-base"></i> WhatsApp
                </a>
            </div>
        </div>
    `;

    document.getElementById('course-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
    document.getElementById('course-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// =========================================================================
// RAZORPAY COURSE BOOKING & PAYMENT GATEWAY INTEGRATION
// =========================================================================

let lastVerifiedRegId = null;

function openBookingModal(courseId, preferredPaymentType = 'advance') {
    closeCourseModal();
    const course = COURSES_DATA.find(c => c.id === courseId);
    if (!course) return;

    // Populate Modal Elements
    document.getElementById('book-course-id').value = course.id;
    document.getElementById('book-course-name').textContent = course.name;
    document.getElementById('book-course-duration').textContent = `${course.durationText} Program`;
    document.getElementById('book-course-total-fee').textContent = course.formattedFee;
    document.getElementById('book-full-fee-display').textContent = course.formattedFee;

    // Remaining balance for advance option
    const advanceBalance = course.fee - 2499;
    document.getElementById('book-advance-balance').textContent = `₹${advanceBalance.toLocaleString('en-IN')}`;

    // Select the radio button
    const radios = document.getElementsByName('booking-payment-type');
    radios.forEach(r => {
        r.checked = (r.value === preferredPaymentType);
    });

    // Reset error banner
    const errBanner = document.getElementById('booking-error-banner');
    if (errBanner) errBanner.classList.add('hidden');

    updatePaymentCalculation();

    document.getElementById('booking-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function updatePaymentCalculation() {
    const courseId = document.getElementById('book-course-id').value;
    const course = COURSES_DATA.find(c => c.id === courseId);
    if (!course) return;

    const radios = document.getElementsByName('booking-payment-type');
    let selectedType = 'advance';
    radios.forEach(r => {
        if (r.checked) selectedType = r.value;
    });

    const isAdvance = selectedType === 'advance';
    const amountToPay = isAdvance ? 2499 : course.fee;
    const remainingBalance = isAdvance ? (course.fee - 2499) : 0;

    // Update summary box
    document.getElementById('summary-total-fee').textContent = course.formattedFee;
    document.getElementById('summary-payable-now').textContent = `₹${amountToPay.toLocaleString('en-IN')}`;
    document.getElementById('summary-remaining-balance').textContent = `₹${remainingBalance.toLocaleString('en-IN')}`;

    // Update button label
    const btnLabel = document.getElementById('book-pay-btn-label');
    if (btnLabel) {
        btnLabel.textContent = isAdvance ? 'PROCEED TO PAY ₹2,499 (RAZORPAY)' : `PROCEED TO PAY ${course.formattedFee} (RAZORPAY)`;
    }

    // Toggle card highlights
    const cardAdvance = document.getElementById('card-option-advance');
    const cardFull = document.getElementById('card-option-full');
    if (cardAdvance && cardFull) {
        if (isAdvance) {
            cardAdvance.classList.add('border-mint', 'bg-white/10');
            cardAdvance.classList.remove('border-white/20');
            cardFull.classList.remove('border-mint', 'bg-white/10');
            cardFull.classList.add('border-white/20');
        } else {
            cardFull.classList.add('border-mint', 'bg-white/10');
            cardFull.classList.remove('border-white/20');
            cardAdvance.classList.remove('border-mint', 'bg-white/10');
            cardAdvance.classList.add('border-white/20');
        }
    }
}

// Student Registration and Razorpay Checkout Submission
async function handleBookingFormSubmit(e) {
    e.preventDefault();

    const courseId = document.getElementById('book-course-id').value;
    const course = COURSES_DATA.find(c => c.id === courseId);
    if (!course) {
        showBookingError("Please select a valid course track.");
        return;
    }

    const name = document.getElementById('book-name').value.trim();
    const email = document.getElementById('book-email').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const whatsapp = document.getElementById('book-whatsapp').value.trim();
    const college = document.getElementById('book-college').value.trim();
    const department = document.getElementById('book-department').value.trim();
    const year = document.getElementById('book-year').value;
    const state = document.getElementById('book-state').value.trim();

    const radios = document.getElementsByName('booking-payment-type');
    let paymentType = 'advance';
    radios.forEach(r => { if (r.checked) paymentType = r.value; });

    // Validation
    if (!name || !email || !phone) {
        showBookingError("Please fill in all required fields (Name, Email, Mobile).");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showBookingError("Please enter a valid email address.");
        return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
        showBookingError("Please enter a valid 10-digit mobile number.");
        return;
    }

    const payBtn = document.getElementById('book-pay-btn');
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Connecting to Razorpay...</span>';

    try {
        // Step 1: Initiate Student Registration on Backend
        const initRes = await fetch('/api/registration/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: name,
                email,
                phone: cleanPhone,
                whatsapp: whatsapp || cleanPhone,
                college,
                department,
                year_of_study: year,
                state,
                course_id: course.id,
                course_name: course.name,
                payment_type: paymentType
            })
        });

        const initData = await initRes.json();
        if (!initRes.ok || !initData.success) {
            throw new Error(initData.error || 'Failed to initiate admission registration.');
        }

        const registrationId = initData.registration_id;

        // Step 2: Create Razorpay Order on Backend
        const orderRes = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registration_id: registrationId })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success) {
            throw new Error(orderData.error || 'Failed to create payment order on server.');
        }

        // Step 3: Initialize Razorpay Checkout Window
        const isAdvance = paymentType === 'advance';
        const options = {
            key: orderData.key_id,
            amount: orderData.amount, // in paise
            currency: "INR",
            name: "NEXTGEN DMA VENTURES",
            description: `${isAdvance ? 'Advance Slot Reservation' : 'Full Payment'} - ${course.name}`,
            image: "./logo.jpeg",
            order_id: orderData.order_id,
            handler: async function (response) {
                // Step 4: Server-Side Signature Verification
                payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Verifying Payment Signature...</span>';
                await verifyPaymentWithBackend({
                    registration_id: registrationId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });
            },
            prefill: {
                name: name,
                email: email,
                contact: cleanPhone
            },
            notes: {
                registration_id: registrationId,
                course_name: course.name,
                payment_type: paymentType
            },
            theme: {
                color: "#65D2C5"
            },
            modal: {
                ondismiss: function () {
                    // Record payment abandoned / cancelled
                    fetch('/api/payment/payment-failed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            registration_id: registrationId,
                            razorpay_order_id: orderData.order_id,
                            error_description: 'Payment modal closed before transaction completion'
                        })
                    });
                    showBookingError('Payment cancelled. Your registration ID is ' + registrationId + '. You can retry payment anytime.');
                    resetBookingPayBtn();
                }
            }
        };

        // Open Razorpay Checkout Window
        if (typeof Razorpay !== 'undefined') {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (resp) {
                fetch('/api/payment/payment-failed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        registration_id: registrationId,
                        razorpay_order_id: orderData.order_id,
                        error_description: resp.error ? resp.error.description : 'Payment failed'
                    })
                });
                showBookingError('Payment Failed: ' + (resp.error ? resp.error.description : 'Transaction was declined'));
                resetBookingPayBtn();
            });
            rzp.open();
        } else {
            // Fallback simulator for offline dev without Razorpay script loaded
            console.warn("Razorpay script not detected, triggering development mock verification");
            await verifyPaymentWithBackend({
                registration_id: registrationId,
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: `sig_mock_${Date.now()}`
            });
        }

    } catch (err) {
        showBookingError(err.message);
        resetBookingPayBtn();
    }
}

// Server-side payment verification
async function verifyPaymentWithBackend(verificationData) {
    try {
        const verifyRes = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verificationData)
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Server signature verification failed.');
        }

        lastVerifiedRegId = verifyData.registration_id;

        // Close checkout modal & show confirmed success screen
        closeBookingModal();
        displayPaymentSuccessModal(verifyData);

    } catch (err) {
        showBookingError('Payment Verification Alert: ' + err.message);
        resetBookingPayBtn();
    }
}

function displayPaymentSuccessModal(data) {
    const r = data.receipt || {};
    const isAdvance = r.payment_type === 'advance';

    document.getElementById('success-reg-id').textContent = data.registration_id;
    document.getElementById('success-student-name').textContent = r.student_name;
    document.getElementById('success-course-name').textContent = `${r.course_name} (${r.duration})`;
    document.getElementById('success-total-fee').textContent = `₹${Number(r.total_fee).toLocaleString('en-IN')}`;
    document.getElementById('success-amount-paid').textContent = `₹${Number(r.amount_paid).toLocaleString('en-IN')}`;
    document.getElementById('success-remaining-balance').textContent = `₹${Number(r.remaining_balance).toLocaleString('en-IN')}`;
    document.getElementById('success-payment-id').textContent = r.payment_id || 'Verified';
    document.getElementById('success-payment-status').textContent = isAdvance ? 'Advance Paid – Slot Reserved' : 'Fully Paid';

    const note = document.getElementById('success-tailored-note');
    if (note) {
        note.textContent = isAdvance
            ? 'Your ₹2,499 advance payment is confirmed. Your course slot reservation has been recorded and adjusted against your total fee.'
            : 'Your full course payment has been confirmed. Your seat is 100% secured.';
    }

    document.getElementById('payment-success-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    document.getElementById('payment-success-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    navigateToTab('home');
}

function downloadVerifiedReceipt() {
    if (!lastVerifiedRegId) {
        alert('Receipt ID not available.');
        return;
    }
    window.open(`/api/registration/status/${lastVerifiedRegId}?print=true`, '_blank');
}

function showBookingError(msg) {
    const errBanner = document.getElementById('booking-error-banner');
    const errText = document.getElementById('booking-error-text');
    if (errBanner && errText) {
        errText.textContent = msg;
        errBanner.classList.remove('hidden');
    } else {
        alert(msg);
    }
}

function resetBookingPayBtn() {
    const payBtn = document.getElementById('book-pay-btn');
    if (!payBtn) return;
    payBtn.disabled = false;
    updatePaymentCalculation();
}

// =========================================================================
// COURSE ENQUIRY / GENERAL APPLY NOW WORKFLOW
// =========================================================================

function applyForCourse(courseId) {
    closeCourseModal();
    const course = COURSES_DATA.find(c => c.id === courseId);
    if (!course) return;

    navigateToTab('contact');

    // Automatically populate Selected Course and Course Fee
    const select = document.getElementById('form-course');
    if (select) {
        select.value = course.name;
    }

    const feeInput = document.getElementById('form-fee');
    if (feeInput) {
        feeInput.value = `${course.formattedFee} (${course.durationText})`;
    }

    // Scroll smoothly to the enquiry form section
    const enquirySection = document.getElementById('enquiry-form-section');
    if (enquirySection) {
        enquirySection.scrollIntoView({ behavior: 'smooth' });
    }

    // Focus on the student name field
    const nameField = document.getElementById('form-name');
    if (nameField) {
        setTimeout(() => nameField.focus(), 400);
    }
}

function scrollToEnquiry(courseTitle, courseFee) {
    navigateToTab('contact');

    if (courseTitle) {
        const select = document.getElementById('form-course');
        if (select) {
            select.value = courseTitle;
        }
        const matched = COURSES_DATA.find(c => c.name === courseTitle || c.title === courseTitle);
        const feeInput = document.getElementById('form-fee');
        if (feeInput) {
            feeInput.value = matched ? `${matched.formattedFee} (${matched.durationText})` : (courseFee || '');
        }
    }

    const enquirySection = document.getElementById('enquiry-form-section');
    if (enquirySection) {
        enquirySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Form Validation and Submission with Clean API Integration Point
function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const college = document.getElementById('form-college') ? document.getElementById('form-college').value.trim() : '';
    const course = document.getElementById('form-course').value;
    const fee = document.getElementById('form-fee') ? document.getElementById('form-fee').value : '';
    const message = document.getElementById('form-message') ? document.getElementById('form-message').value.trim() : '';
    const learningMode = document.querySelector('input[name="learning-mode"]:checked') ? document.querySelector('input[name="learning-mode"]:checked').value : 'Bangalore Classroom';

    const errorBanner = document.getElementById('form-error-message');
    const successBanner = document.getElementById('form-success-message');

    if (errorBanner) errorBanner.classList.add('hidden');
    if (successBanner) successBanner.classList.add('hidden');

    // Validation 1: Required Fields
    if (!name || !email || !phone || !course) {
        showFormError("Please fill in all required fields (Name, Email, Mobile Number, and Selected Course).");
        return;
    }

    // Validation 2: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormError("Please provide a valid email address (e.g. rahul@example.com).");
        return;
    }

    // Validation 3: Phone number (at least 10 digits)
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 10) {
        showFormError("Please provide a valid mobile number with at least 10 digits.");
        return;
    }

    // Prepared application payload
    const applicationPayload = {
        studentName: name,
        email: email,
        mobileNumber: phone,
        collegeOrInstitution: college || 'Not Specified',
        selectedCourse: course,
        courseFee: fee,
        learningMode: learningMode,
        message: message,
        submittedAt: new Date().toISOString()
    };

    // Clean API Integration Point
    submitCourseApplicationAPI(applicationPayload)
        .then(response => {
            if (successBanner) {
                const detailsSpan = document.getElementById('success-course-details');
                if (detailsSpan) {
                    detailsSpan.textContent = `Applied for: ${course} — Fee: ${fee}`;
                }
                successBanner.classList.remove('hidden');
            }
            document.getElementById('enquiry-form').reset();
            const feeInput = document.getElementById('form-fee');
            if (feeInput) feeInput.value = '';

            setTimeout(() => {
                if (successBanner) successBanner.classList.add('hidden');
            }, 8000);
        })
        .catch(err => {
            showFormError("There was a problem sending your enquiry. Please try again or message our team directly via WhatsApp.");
        });
}

function showFormError(msg) {
    let errorBanner = document.getElementById('form-error-message');
    if (!errorBanner) {
        alert(msg);
        return;
    }
    const errorText = document.getElementById('form-error-text');
    if (errorText) errorText.textContent = msg;
    errorBanner.classList.remove('hidden');
}

// Clean API Integration Handler (Ready for Backend/Webhook Integration)
async function submitCourseApplicationAPI(payload) {
    console.log("=== NEXTGEN DMA VENTURES COURSE APPLICATION PAYLOAD ===", payload);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                status: "success",
                statusCode: 200,
                message: "Application recorded successfully.",
                data: payload
            });
        }, 500);
    });
}
