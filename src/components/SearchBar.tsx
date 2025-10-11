import React, { useState, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search for music videos..." 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative flex items-center bg-gable-green border-2 rounded-full overflow-hidden transition-all duration-300 ${
        isFocused ? 'border-calypso shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="pl-4 pr-2">
        <SearchIcon className="w-5 h-5 text-timberwolf opacity-60" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-timberwolf placeholder-opacity-50 py-3 pr-4 outline-none text-sm"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="pr-4 hover:opacity-75 transition-opacity"
          aria-label="Clear search"
        >
          <X className="w-5 h-5 text-timberwolf opacity-60" />
        </button>
      )}
    </form>
  );
};
