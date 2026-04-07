import { useEffect, useMemo, useState } from "react";
import type { LinkItem } from "@/data/links";

export type ActiveFilter = {
  label: string;
  value: string;
};

export const useLinkFilters = (allLinks: LinkItem[], pageSize: number) => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleTag = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag]
    );
  };

  const clearAll = () => {
    setSearch("");
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return allLinks.filter((link) => {
      const matchesSearch =
        !search ||
        link.title.toLowerCase().includes(search.toLowerCase()) ||
        link.description.toLowerCase().includes(search.toLowerCase()) ||
        link.tags.some((item) => item.toLowerCase().includes(search.toLowerCase()));

      const matchesTags = selectedTags.length === 0 || link.tags.some((item) => selectedTags.includes(item));

      return matchesSearch && matchesTags;
    });
  }, [allLinks, search, selectedTags]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTags]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  const placeholderCount = currentPage === totalPages ? pageSize - paginatedLinks.length : 0;
  const hasFilters = search.length > 0 || selectedTags.length > 0;
  const activeFilters: ActiveFilter[] = selectedTags.map((item) => ({ label: item, value: item }));

  return {
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
  };
};
