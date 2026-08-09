import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { useFoodSearch } from '../../../hooks/useSearch';

export const ManualSearch = ({ onSelectFood }) => {
  const [query, setQuery] = useState('');
  const { data: results = [], isLoading } = useFoodSearch(query);

  return (
    <div className="flex flex-col gap-4 w-full">
      <Input
        label="SEARCH FOOD DATABASE"
        placeholder="Type food name (e.g. Paneer Butter Masala, Roti...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query.length > 0 && query.length <= 2 && (
        <span className="font-mono text-xs text-muted">Type at least 3 characters to search...</span>
      )}

      {isLoading && <span className="font-mono text-xs text-muted">Searching database...</span>}

      {results.length > 0 && (
        <div className="border border-border rounded-lg bg-white overflow-hidden max-h-[260px] overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id || item.name}
              type="button"
              onClick={() => onSelectFood && onSelectFood(item)}
              className="w-full px-4 py-3 text-left border-b border-border hover:bg-surface flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-sans font-medium text-sm text-black block">{item.name}</span>
                <span className="font-mono text-xs text-muted">{item.serving || '100g serving'}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-black">{item.calories} kcal</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
