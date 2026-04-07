import { useEffect } from "react";

export const useResumePageNavigation = (
  sectionRefs: (HTMLElement | null)[],
  activeSectionId: string,
  onNavigate: (direction: "prev" | "next") => void
) => {
  const navigateTo = (index: number) => {
    const section = sectionRefs[index];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToPrevious = () => {
    const currentIndex = sectionRefs.findIndex((section) => section?.id === activeSectionId);
    if (currentIndex > 0) {
      navigateTo(currentIndex - 1);
      onNavigate("prev");
    }
  };

  const goToNext = () => {
    const currentIndex = sectionRefs.findIndex((section) => section?.id === activeSectionId);
    if (currentIndex < sectionRefs.length - 1) {
      navigateTo(currentIndex + 1);
      onNavigate("next");
    }
  };

  const currentIndex = sectionRefs.findIndex((section) => section?.id === activeSectionId);
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === sectionRefs.length - 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSectionId, sectionRefs.length]);

  return {
    goToPrevious,
    goToNext,
    isAtStart,
    isAtEnd,
  };
};
