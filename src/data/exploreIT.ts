import rolesJson from "@/data/explore-it-data.json";

export type ITRole = {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  relatedRoles: string[];
  roadmapUrl: string;
};

export const itRoles: ITRole[] = rolesJson as ITRole[];

export const roleMap = new Map(itRoles.map((r) => [r.id, r]));
