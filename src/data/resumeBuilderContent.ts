export type ResumePageContent = {
  id: string;
  title: string;
  subtitle: string;
  summary?: string;
  body?: string[];
  highlights?: string[];
  accent?: string;
  borderClass?: string;
  noCard?: boolean;
};

export type OtherWorkingExperience = {
  title: string;
  subtitle: string;
  tags: string[];
};

export type EducationDetails = {
  institution: string;
  degree: string;
  period: string;
  grade: string;
  focus: string;
};

export type AwardItem = {
  title: string;
  issuer: string;
  note: string;
};

export type SkillGroups = {
  proficient: string[];
  fluent: string[];
  entryLevel: string[];
};

export type ToolsGroups = SkillGroups & {
  introductory: string[];
};

export type ResumeBuilderContent = {
  resumePages: ResumePageContent[];
  projectItems: string[];
  otherWorkingExperiences: OtherWorkingExperience[];
  educationDetails: EducationDetails;
  honorsAndAwards: AwardItem[];
  keySkills: SkillGroups;
  toolsAndEquipment: ToolsGroups;
  highlightedCredentials: string[];
};

export const defaultResumeBuilderContent: ResumeBuilderContent = {
  resumePages: [
    {
      id: "overview",
      title: "Carlos Richard Geraldine",
      subtitle: "Bridge, design, and deliver solutions that matter.",
    },
    {
      id: "work-1",
      title: "Microsoft 365 Engineer at SoftwareOne Indonesia",
      subtitle: "Freelance & On-site, Oct 2025 – Mar 2026 (7 months)",
      summary:
        "Microsoft 365 engineering work centered on secure productivity, DLP deployment, and operational support for more than 10,000 users.",
      body: [
        "Delivered configurations and policies for Microsoft 365, SharePoint Online, Exchange Online, Entra ID, Purview, and Intune, validating them and troubleshooting user and admin-reported issues to ensure compliance and secure endpoint and app management.",
        "Streamlined enterprise secure productivity deployments by resolving configuration inquiries and designing business dashboard using Power BI, reducing policy misconfigurations and accelerating rollout timelines.",
        "Successfully deployed Data Loss Prevention (DLP) policies with 99% adoption rate to more than 10,000 users across Indonesia, ensuring consistent data governance and strengthening the organization's information-protection posture.",
      ],
      highlights: ["Microsoft 365", "SharePoint", "Intune", "Purview", "DLP"],
      accent: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500",
      borderClass: "border-emerald-400/70",
    },
    {
      id: "work-2",
      title: "Functional Consultant at PT Dinamika Teknologi Informasi",
      subtitle: "Contract & Remote, Jan 2025 – Sep 2025 (9 months)",
      summary:
        "Functional consulting and project delivery for Dynamics 365 CRM, Power Platform, and Microsoft 365 for Education implementation.",
      body: [
        "Collaborated with stakeholders to gather business requirements and translate them into functional specifications of Microsoft Dynamics 365 CRM and Power Platform solutions.",
        "Extended Dynamics 365 CE into 7 modules for education management system application using Power Platform and provided relevant training for the back-office staff and office administrator.",
        "Supported the implementation and provided training session of Microsoft 365 for Education, which includes Office 365, Teams for Education, SharePoint Online, and Entra for teachers, educators and school admins.",
      ],
      highlights: ["Dynamics 365", "Power Platform", "Project Management", "Training"],
      accent: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
      borderClass: "border-amber-400/70",
    },
    {
      id: "other-working-experience",
      title: "Other Working Experience",
      subtitle: "Additional role history before current consulting and M365 roles.",
      noCard: true,
    },
    {
      id: "projects",
      title: "Projects",
      subtitle: "Selected implementations and practice portfolios.",
    },
    {
      id: "key-skills",
      title: "Key Skills",
      subtitle: "Capability levels across business, technical, and delivery functions.",
      noCard: true,
    },
    {
      id: "tools-equipment",
      title: "Tools and Equipment",
      subtitle: "Core platforms and tools grouped by proficiency level.",
      noCard: true,
    },
    {
      id: "highlighted-credentials",
      title: "Highlighted Credentials",
      subtitle: "Selected certifications and professional credentials.",
      noCard: true,
    },
    {
      id: "linguistic-psychometrics",
      title: "Linguistic and Psychometrics",
      subtitle: "Language proficiency and behavioral assessment profile.",
      summary:
        "Strengths: strong language proficiency, analytical depth, and exploratory drive. Weaknesses: uneven consistency and emotional volatility under pressure. Opportunities: roles in strategy, communication, and cross-functional leadership. Threats: burnout risk and overextension in high-change environments.",
      highlights: ["CEFR C1", "INFJ", "Type 3", "IAE", "Explorer", "Analytical"],
      borderClass: "border-sky-400/70",
    },
    {
      id: "education-honors",
      title: "Education & Honors",
      subtitle: "Academic background and notable recognitions.",
      noCard: true,
    },
    {
      id: "contact",
      title: "Contact",
      subtitle: "",
      body: [
        "Email: carlosrichardgeraldine@outlook.com",
        "LinkedIn: https://www.linkedin.com/in/carlosgeraldine/",
        "WhatsApp: https://wa.me/6285770078016",
      ],
      highlights: ["Email", "LinkedIn", "WhatsApp", "Linktree"],
      accent: "bg-gradient-to-r from-slate-500 via-zinc-500 to-stone-500",
      borderClass: "border-slate-400/70",
    },
  ],
  projectItems: [
    "Microsoft Office 365, Purview DLP and Intune Implementation at national multi-finance company in Jakarta.",
    "Extending Dynamics 365 CRM with Power Platform for ISV Success and private school in Jakarta + Google Workspace migration to Microsoft 365 for Education.",
    "Snowflake Hands-On Essentials Data Warehouse, Data App (Streamlit), Data Lake, Data Engineering & Data Science labs.",
    "ServiceNow Administration Fundamentals, Configure the CMDB & CMDB Health Simulator.",
    "Anaplan Level 1 & 2 Model Builder Exercise.",
    "Salesforce Agentforce Service & Prompt Builder Templates.",
    "Microsoft PowerUp Challenge Portfolio - simple Power Apps, Power Automate and Power BI solutions.",
    "CI/CD, Serverless and Microservices using OpenStack (Podman, Kubernetes, OpenShift and Tekton) with IBM Skills Network.",
    "Implementing CI/CD using Docker, Jenkins, Grafana, Prometheus with Dicoding Indonesia.",
    "Rice University Engineering Project Management Capstone Project",
    "University of California, Irvine Project Management Capstone Project",
  ],
  otherWorkingExperiences: [
    {
      title: "Project Coordinator (Laravel/React Webdev Project) at Goals Academy",
      subtitle: "Freelance & On-site, Jan 2024 - Dec 2024 (1 year)",
      tags: ["Project Management", "Web Development"],
    },
    {
      title: "Business to Business (B2B) Area Account Officer at PT Agrinesia Raya",
      subtitle: "Contract & On-site, Nov 2022 - Dec 2023 (1 year 2 months)",
      tags: ["B2B Marketing", "Sales"],
    },
    {
      title: "Optician Assistant and Sales Counter at Optik Internasional Group",
      subtitle: "Contract, Oct 2019 - Oct 2022 (3 years 1 months)",
      tags: ["Sales", "Customer Service"],
    },
  ],
  educationDetails: {
    institution: "University of the People",
    degree: "Bachelor of Science - BS, Computer Science",
    period: "Oct 2023 - Jun 2027",
    grade: "Grade: 3.25/4.0",
    focus: "Database Management System (DBMS), Operating Systems",
  },
  honorsAndAwards: [
    {
      title: "ASEAN Youth for Digital Action",
      issuer: "Issued by ASEAN & Orbit Future Academy · Feb 2025",
      note: "Professional Scholarship Awardee",
    },
    {
      title: "University of the People Full Scholarship",
      issuer: "Issued by University of the People · Dec 2024",
      note: "Scholarship Awardee",
    },
    {
      title: "Beasiswa Kemendikbudristek ICE Institute Semester 2024.1",
      issuer:
        "Issued by Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia · Feb 2024",
      note: "Scholarship Awardee",
    },
  ],
  keySkills: {
    proficient: ["Business Analysis", "IT Solutions Design", "Low-code-no-code AI Platform"],
    fluent: [
      "Project Management",
      "Presales",
      "Cloud Computing",
      "IT Support",
      "System Administration",
      "Identity & Access Management",
      "Data Loss Prevention",
      "IT Service Management",
    ],
    entryLevel: [
      "Microsoft Licensing",
      "Data Analysis",
      "Data Engineering",
      "Database Administration",
      "Mobile Device Management",
    ],
  },
  toolsAndEquipment: {
    proficient: ["Power Apps", "Power Automate", "Power BI", "Dataverse", "Purview"],
    fluent: [
      "Dynamics 365 CRM",
      "SharePoint Online",
      "Exchange Online",
      "Microsoft 365",
      "Office 365",
      "Snowflake",
      "SQL",
      "Python",
      "Jira",
      "Confluence",
      "Camunda",
      "Signavio",
      "BPMN",
      "DMN",
      "UML",
      "DFD",
      "FSD",
      "BRD/PRD",
    ],
    entryLevel: [
      "Copilot Studio",
      "Azure Admin",
      "Azure DevOps",
      "Intune",
      "Anaplan",
      "Delinea",
      "ManageEngine",
      "Google Cloud Security Command Center",
      "ServiceNow",
      "Microsoft Entra",
      "Microsoft Defender",
      "CyberArk PAM",
      "Debian",
      "Ubuntu",
    ],
    introductory: [
      "Microsoft Fabric",
      "Azure AI Services",
      "Microsoft Foundry",
      "Dynamics 365 ERP",
      "Oracle Cloud",
      "Oracle Fusion ERP",
      "AWS Cloud Services",
      "Salesforce",
      "Creatio",
      "Datadog",
      "Okta",
      "Docker",
      "Elastic",
    ],
  },
  highlightedCredentials: [
    "Microsoft Certified: Power Platform Solution Architect Expert",
    "Microsoft Certified: Power Platform Functional Consultant Associate",
    "Microsoft Certified: Information Security Administrator Associate",
    "Microsoft Certified: Identity and Access Administrator Associate",
    "Microsoft Certified: Dynamics 365 Customer Experience Analyst Associate",
    "Microsoft Certified: Dynamics 365 Field Service Functional Consultant Associate",
    "Microsoft Certified: Dynamics 365 Customer Service Functional Consultant Associate",
    "Snowflake SnowPro Associate: Platform Certification",
    "GitHub Foundations",
    "ServiceNow Suite Certification - Data Foundations (CMDB and CSDM) Professional",
    "SAP Certified - Business Transformation Consultant",
    "SAP Certified - Organizational Change Management",
    "SailPoint Identity Security Leader Credential",
    "Fortinet Certified Associate Cybersecurity",
    "LinkedIn Learning Change Management Professional Certificate",
    "Microsoft Business Analyst Professional Certificate",
    "Microsoft and LinkedIn Career Essentials in System Administration",
    "Google Cybersecurity Professional Certificate",
    "Google Business Intelligence Professional Certificate",
    "Google IT Support Professional Certificate",
    "Google Project Management Professional Certificate",
    "ISC2 Certified in Cybersecurity",
    "Certified ARIS Modeler Associate",
    "Camunda Knowledge - Business Analyst",
  ],
};

export const createResumeBuilderContent = (): ResumeBuilderContent =>
  JSON.parse(JSON.stringify(defaultResumeBuilderContent)) as ResumeBuilderContent;
