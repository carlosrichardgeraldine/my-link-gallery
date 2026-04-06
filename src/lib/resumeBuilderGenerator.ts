import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";
import resumeTemplate from "@/pages/Resume.tsx.bak?raw";

export const resumeBuilderStorageKey = "my-link-gallery.resume-builder.draft.v1";

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

const replaceConst = (source: string, constName: string, literal: string) => {
  const pattern = new RegExp(`const\\s+${constName}\\s*=\\s*[\\s\\S]*?;\\r?\\n`);
  return source.replace(pattern, `const ${constName} = ${literal};\n`);
};

const extractConstLiteral = (source: string, constName: string) => {
  const pattern = new RegExp(`const\\s+${constName}\\s*=\\s*([\\s\\S]*?);\\r?\\n`);
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? null;
};

const evalLiteral = <T>(literal: string) => {
  return new Function(`return (${literal});`)() as T;
};

const LINGUISTIC_PSYCHOMETRICS_PAGE_ID = "linguistic-psychometrics";

const removeLinguisticPsychometricsPage = (pages: ResumeBuilderContent["resumePages"]) => {
  return pages.filter((page) => page.id !== LINGUISTIC_PSYCHOMETRICS_PAGE_ID);
};

const createBlankEducation = (): ResumeBuilderContent["educationDetails"][number] => ({
  institution: "",
  degree: "",
  period: "",
  grade: "",
  focus: "",
});

const normalizeEducationDetails = (value: unknown): ResumeBuilderContent["educationDetails"] => {
  const rawItems = Array.isArray(value) ? value : [value];
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      institution: typeof item.institution === "string" ? item.institution : "",
      degree: typeof item.degree === "string" ? item.degree : "",
      period: typeof item.period === "string" ? item.period : "",
      grade: typeof item.grade === "string" ? item.grade : "",
      focus: typeof item.focus === "string" ? item.focus : "",
    }));
};

export const parseResumeContentFromSource = (source: string): ResumeBuilderContent | null => {
  try {
    const resumePagesLiteral = extractConstLiteral(source, "resumePages");
    const projectItemsLiteral = extractConstLiteral(source, "projectItems");
    const otherWorkingExperiencesLiteral = extractConstLiteral(source, "otherWorkingExperiences");
    const educationDetailsLiteral = extractConstLiteral(source, "educationDetails");
    const honorsAndAwardsLiteral = extractConstLiteral(source, "honorsAndAwards");
    const keySkillsLiteral = extractConstLiteral(source, "keySkills");
    const toolsAndEquipmentLiteral = extractConstLiteral(source, "toolsAndEquipment");
    const highlightedCredentialsLiteral = extractConstLiteral(source, "highlightedCredentials");
    const overviewDetailsLiteral = extractConstLiteral(source, "overviewDetails");
    const rollingKeywordRowsLiteral = extractConstLiteral(source, "rollingKeywordRows");

    if (
      !resumePagesLiteral ||
      !projectItemsLiteral ||
      !otherWorkingExperiencesLiteral ||
      !educationDetailsLiteral ||
      !honorsAndAwardsLiteral ||
      !keySkillsLiteral ||
      !toolsAndEquipmentLiteral ||
      !highlightedCredentialsLiteral ||
      !overviewDetailsLiteral ||
      !rollingKeywordRowsLiteral
    ) {
      return null;
    }

    const overviewDetailsRaw = new Function(
      "MapPin",
      "MapPinned",
      "ArrowRightLeft",
      "Briefcase",
      `return (${overviewDetailsLiteral});`
    )(null, null, null, null) as Array<{ text?: string }>;

    return {
      resumePages: removeLinguisticPsychometricsPage(
        evalLiteral<ResumeBuilderContent["resumePages"]>(resumePagesLiteral)
      ),
      projectItems: evalLiteral<ResumeBuilderContent["projectItems"]>(projectItemsLiteral),
      otherWorkingExperiences: evalLiteral<ResumeBuilderContent["otherWorkingExperiences"]>(otherWorkingExperiencesLiteral),
      educationDetails: normalizeEducationDetails(evalLiteral<unknown>(educationDetailsLiteral)),
      honorsAndAwards: evalLiteral<ResumeBuilderContent["honorsAndAwards"]>(honorsAndAwardsLiteral),
      keySkills: evalLiteral<ResumeBuilderContent["keySkills"]>(keySkillsLiteral),
      toolsAndEquipment: evalLiteral<ResumeBuilderContent["toolsAndEquipment"]>(toolsAndEquipmentLiteral),
      highlightedCredentials: evalLiteral<ResumeBuilderContent["highlightedCredentials"]>(highlightedCredentialsLiteral),
      overviewDetails: overviewDetailsRaw.map((item) => ({ text: item.text ?? "" })),
      rollingKeywordRows: evalLiteral<ResumeBuilderContent["rollingKeywordRows"]>(rollingKeywordRowsLiteral),
    };
  } catch {
    return null;
  }
};

const buildOverviewDetailsLiteral = (details: Array<{ text: string }>) => {
  const iconNames = ["MapPin", "MapPinned", "ArrowRightLeft", "Briefcase"];
  const texts = details.slice(0, iconNames.length).map((item) => item.text);

  while (texts.length < iconNames.length) {
    texts.push("");
  }

  const lines = iconNames.map(
    (iconName, index) =>
      `  {\n    icon: ${iconName},\n    text: ${JSON.stringify(texts[index])},\n  }`
  );

  return `[\n${lines.join(",\n")}\n]`;
};

export const buildResumeTsx = (content: ResumeBuilderContent) => {
  let output = resumeTemplate;

  const resumePagesWithoutLinguisticPsychometrics = removeLinguisticPsychometricsPage(content.resumePages);

  output = replaceConst(output, "resumePages", formatJson(resumePagesWithoutLinguisticPsychometrics));
  output = replaceConst(output, "projectItems", formatJson(content.projectItems));
  output = replaceConst(output, "otherWorkingExperiences", formatJson(content.otherWorkingExperiences));
  output = replaceConst(output, "educationDetails", formatJson(normalizeEducationDetails(content.educationDetails)));
  output = replaceConst(output, "honorsAndAwards", formatJson(content.honorsAndAwards));
  output = replaceConst(output, "keySkills", formatJson(content.keySkills));
  output = replaceConst(output, "toolsAndEquipment", formatJson(content.toolsAndEquipment));
  output = replaceConst(output, "highlightedCredentials", formatJson(content.highlightedCredentials));
  output = replaceConst(output, "rollingKeywordRows", formatJson(content.rollingKeywordRows));
  output = replaceConst(output, "overviewDetails", buildOverviewDetailsLiteral(content.overviewDetails));

  return output;
};

export const downloadResumeTsx = (content: ResumeBuilderContent) => {
  const file = new Blob([buildResumeTsx(content)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "Resume.tsx";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
