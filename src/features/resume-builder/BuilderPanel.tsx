import type { ResumeBuilderContent, SkillGroups, ToolsGroups } from "@/data/resumeBuilderContent";
import { AwardEditor } from "@/features/resume-builder/editors/AwardEditor";
import { EducationEditor } from "@/features/resume-builder/editors/EducationEditor";
import { ExperienceEditor } from "@/features/resume-builder/editors/ExperienceEditor";
import { ResumePagesEditor } from "@/features/resume-builder/editors/ResumePagesEditor";
import { SkillGroupsEditor } from "@/features/resume-builder/editors/SkillGroupsEditor";
import {
  HighlightedCredentialsTableEditor,
  ProjectItemsTableEditor,
} from "@/features/resume-builder/editors/TableEditors";
import type { SectionId } from "@/features/resume-builder/config";

type BuilderPanelProps = {
  activeSection: SectionId;
  content: ResumeBuilderContent;
  setContent: (next: ResumeBuilderContent) => void;
};

export const BuilderPanel = ({ activeSection, content, setContent }: BuilderPanelProps) => {
  if (activeSection === "resumePages") {
    return (
      <ResumePagesEditor
        items={content.resumePages}
        onChange={(next) => setContent({ ...content, resumePages: next })}
        overviewDetails={content.overviewDetails}
        onOverviewDetailsChange={(next) => setContent({ ...content, overviewDetails: next })}
        rollingKeywordRows={content.rollingKeywordRows}
        onRollingKeywordRowsChange={(next) => setContent({ ...content, rollingKeywordRows: next })}
      />
    );
  }

  if (activeSection === "projectItems") {
    return (
      <ProjectItemsTableEditor
        items={content.projectItems}
        onChange={(next) => setContent({ ...content, projectItems: next })}
      />
    );
  }

  if (activeSection === "otherWorkingExperiences") {
    return (
      <ExperienceEditor
        items={content.otherWorkingExperiences}
        onChange={(next) => setContent({ ...content, otherWorkingExperiences: next })}
      />
    );
  }

  if (activeSection === "educationDetails") {
    return <EducationEditor value={content.educationDetails} onChange={(next) => setContent({ ...content, educationDetails: next })} />;
  }

  if (activeSection === "honorsAndAwards") {
    return <AwardEditor items={content.honorsAndAwards} onChange={(next) => setContent({ ...content, honorsAndAwards: next })} />;
  }

  if (activeSection === "keySkills") {
    return (
      <SkillGroupsEditor
        title="Key Skills"
        description="Edit each proficiency band with one skill per line."
        value={content.keySkills}
        onChange={(next) => setContent({ ...content, keySkills: next as SkillGroups })}
        groups={[
          { key: "proficient", label: "Proficient" },
          { key: "fluent", label: "Fluent" },
          { key: "entryLevel", label: "Entry-level" },
        ]}
      />
    );
  }

  if (activeSection === "toolsAndEquipment") {
    return (
      <SkillGroupsEditor
        title="Tools and Equipment"
        description="Edit each proficiency band with one tool per line."
        value={content.toolsAndEquipment}
        onChange={(next) => setContent({ ...content, toolsAndEquipment: next as ToolsGroups })}
        groups={[
          { key: "proficient", label: "Proficient" },
          { key: "fluent", label: "Fluent" },
          { key: "entryLevel", label: "Entry-level" },
          { key: "introductory", label: "Introductory" },
        ]}
      />
    );
  }

  return (
    <HighlightedCredentialsTableEditor
      items={content.highlightedCredentials}
      onChange={(next) => setContent({ ...content, highlightedCredentials: next })}
    />
  );
};
