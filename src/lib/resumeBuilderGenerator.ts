import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";

export const resumeBuilderStorageKey = "my-link-gallery.resume-builder.draft.v1";

const OVERVIEW_ICON_NAMES = ["MapPin", "MapPinned", "ArrowRightLeft", "Briefcase"] as const;

export const buildResumeSection = (content: ResumeBuilderContent) => {
  const outputPages = [...content.resumePages];

  const outputOverviewDetails = OVERVIEW_ICON_NAMES.map((iconName, index) => ({
    icon: iconName,
    text: content.overviewDetails[index]?.text ?? "",
  }));

  return {
    resumePages: outputPages,
    overviewDetails: outputOverviewDetails,
    rollingKeywordRows: content.rollingKeywordRows,
    projectItems: content.projectItems,
    otherWorkingExperiences: content.otherWorkingExperiences,
    educationDetails: content.educationDetails,
    honorsAndAwards: content.honorsAndAwards,
    keySkills: content.keySkills,
    toolsAndEquipment: content.toolsAndEquipment,
    highlightedCredentials: content.highlightedCredentials,
    contactChannels: content.contactChannels,
  };
};
