import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Filters {
  minAge?: number;
  maxAge?: number;
  major?: string;
  year?: string;
  interests?: string; // comma-separated
  query?: string;
}

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClose?: () => void;
}

export const FilterPanel = ({ filters, onChange, onClose }: Props) => {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="w-full max-w-md p-4 bg-card border border-border rounded-xl space-y-3">
      <h3 className="text-lg font-semibold">Filters</h3>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Min age"
          value={filters.minAge?.toString() || ""}
          onChange={(e) => update({ minAge: e.target.value ? Number(e.target.value) : undefined })}
        />
        <Input
          placeholder="Max age"
          value={filters.maxAge?.toString() || ""}
          onChange={(e) => update({ maxAge: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <Input
        placeholder="Major"
        value={filters.major || ""}
        onChange={(e) => update({ major: e.target.value })}
      />

      <Input
        placeholder="Year (Freshman, Sophomore...)"
        value={filters.year || ""}
        onChange={(e) => update({ year: e.target.value })}
      />

      <Textarea
        placeholder="Interests (comma separated)"
        value={filters.interests || ""}
        onChange={(e) => update({ interests: e.target.value })}
      />

      <Input
        placeholder="Search by name"
        value={filters.query || ""}
        onChange={(e) => update({ query: e.target.value })}
      />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onChange({})}>Clear</Button>
        <Button onClick={onClose}>Apply</Button>
      </div>
    </div>
  );
};

export default FilterPanel;
