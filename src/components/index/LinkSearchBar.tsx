import { Search } from "lucide-react";

type LinkSearchBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

const LinkSearchBar = ({ search, onSearchChange }: LinkSearchBarProps) => {
  return (
    <div className="mb-4 max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, description, or tag..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
};

export default LinkSearchBar;
