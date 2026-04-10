import { useEffect, useMemo, useState } from "react";
import type { ITRole } from "@/data/exploreIT";

export type ActiveFilter = {
  label: string;
  value: string;
};

export const useExploreITFilters = (allRoles: ITRole[], pageSize: number) => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAll = () => {
    setSearch("");
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return allRoles.filter((role) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        role.title.toLowerCase().includes(q) ||
        role.summary.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q) ||
        role.tags.some((t) => t.toLowerCase().includes(q));

      const matchesTags =
        selectedTags.length === 0 || role.tags.some((t) => selectedTags.includes(t));

      return matchesSearch && matchesTags;
    });
  }, [allRoles, search, selectedTags]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered.length, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTags]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  const hasFilters = search.length > 0 || selectedTags.length > 0;
  const activeFilters: ActiveFilter[] = selectedTags.map((t) => ({ label: t, value: t }));

  return {
    search,
    setSearch,
    selectedTags,
    toggleTag,
    clearAll,
    filtered,
    paged,
    totalPages,
    currentPage,
    setCurrentPage,
    hasFilters,
    activeFilters,
  };
};
