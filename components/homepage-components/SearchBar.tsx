"use client";

import { Search, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface SearchBarProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const SearchBar = ({ value, setValue }: SearchBarProps) => {
  return (
    <div className="relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-zinc-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search images..."
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-full py-3 pl-12 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="absolute right-4 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {["Landscape", "Portrait", "Abstract", "Animals", "Cyberpunk"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => setValue(tag)}
              className="px-3 py-1 text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full transition-colors border border-zinc-700/50"
            >
              {tag}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default SearchBar;
