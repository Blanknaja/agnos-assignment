"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/input";
import { Button } from "@/components/button";

interface SearchWithButtonProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export const SearchWithButton: React.FC<SearchWithButtonProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
}) => {
  return (
    <div className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <Button onClick={onSearch} variant="secondary">
        Search
      </Button>
    </div>
  );
};
