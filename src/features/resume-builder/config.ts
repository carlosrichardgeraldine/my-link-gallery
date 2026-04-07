export type SectionId =
  | "resumePages"
  | "projectItems"
  | "otherWorkingExperiences"
  | "educationDetails"
  | "honorsAndAwards"
  | "keySkills"
  | "toolsAndEquipment"
  | "highlightedCredentials";

export const sections: Array<{ id: SectionId; label: string; description: string }> = [
  { id: "resumePages", label: "Resume Pages", description: "Create, edit, and remove page records." },
  { id: "projectItems", label: "Project Items", description: "Edit the project item list." },
  {
    id: "otherWorkingExperiences",
    label: "Other Working Experience",
    description: "Manage the additional work history cards.",
  },
  { id: "educationDetails", label: "Education Details", description: "Create, edit, reorder, and delete education records." },
  { id: "honorsAndAwards", label: "Honors and Awards", description: "Manage certification and award entries." },
  { id: "keySkills", label: "Key Skills", description: "Edit the skill bands by proficiency level." },
  { id: "toolsAndEquipment", label: "Tools and Equipment", description: "Edit the tool bands by proficiency level." },
  { id: "highlightedCredentials", label: "Highlighted Credentials", description: "Edit the credential list." },
];
