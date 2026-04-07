import { type SkillGroups, type ToolsGroups } from "@/data/resumeBuilderContent";

const joinLines = (items: string[]) => items.join("\n");

export const SkillGroupsEditor = <T extends SkillGroups | ToolsGroups>({
  title,
  description,
  value,
  onChange,
  groups,
}: {
  title: string;
  description: string;
  value: T;
  onChange: (next: T) => void;
  groups: Array<{ key: keyof T; label: string }>;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const items = value[group.key] as string[];

          return (
            <label key={String(group.key)} className="space-y-2 rounded-2xl border border-border/70 bg-background/90 p-4">
              <span className="text-sm font-medium text-foreground">{group.label}</span>
              <textarea
                value={joinLines(items)}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [group.key]: event.target.value.split(/\r?\n/),
                  } as T)
                }
                rows={8}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
};
