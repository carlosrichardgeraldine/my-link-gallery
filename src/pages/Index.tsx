import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { links, linksPageSettings } from "@/data/links";
import ThemeToggle from "@/components/ThemeToggle";
import FilterSidebar from "@/components/FilterSidebar";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ActiveFiltersBar from "@/components/index/ActiveFiltersBar";
import LinkSearchBar from "@/components/index/LinkSearchBar";
import LinksGrid from "@/components/index/LinksGrid";
import QuickTagsRow from "@/components/index/QuickTagsRow";
import { useLinkFilters } from "@/hooks/useLinkFilters";

const Index = () => {
  const pageSize = Math.max(1, linksPageSettings.pageSize);
  const quickTags = linksPageSettings.quickTags;
  const {
    search,
    setSearch,
    selectedTags,
    toggleTag,
    clearAll,
    filtered,
    paginatedLinks,
    totalPages,
    currentPage,
    setCurrentPage,
    placeholderCount,
    hasFilters,
    activeFilters,
  } = useLinkFilters(links, pageSize);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4 md:h-16">
          <h1 className="text-base font-semibold text-foreground md:text-2xl">{linksPageSettings.title}</h1>
          <div className="flex items-center gap-3">
            <a
              href="https://build.carlosgeraldine.eu.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:px-5 md:py-2.5 md:text-base"
            >
              Build your own
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-4 pb-24 md:py-6">
        <LinkSearchBar search={search} onSearchChange={setSearch} />

        <QuickTagsRow quickTags={quickTags} selectedTags={selectedTags} onToggleTag={toggleTag} />

        <ActiveFiltersBar
          filteredCount={filtered.length}
          activeFilters={activeFilters}
          hasFilters={hasFilters}
          onToggleTag={toggleTag}
          onClearAll={clearAll}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Main layout */}
        <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <FilterSidebar
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
            />
          </aside>

          {/* Grid */}
          <main className="flex-1">
            <LinksGrid
              filtered={filtered}
              paginatedLinks={paginatedLinks}
              placeholderCount={placeholderCount}
              onClearAll={clearAll}
            />
          </main>
        </div>
      </div>

      </div>

    </div>
  );
};

export default Index;
