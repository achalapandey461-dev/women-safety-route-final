import React from 'react';
import { MapPin, X } from 'lucide-react';
import { JAIPUR_LOCATIONS } from '../utils/safetyScoring';

interface LocationSearchProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isNightMode: boolean;
}

export function LocationSearch({
  label,
  placeholder,
  value,
  onChange,
  isNightMode,
}: LocationSearchProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const suggestions = Object.keys(JAIPUR_LOCATIONS).filter(loc =>
    loc.toLowerCase().includes(value.toLowerCase()) && loc.toLowerCase() !== value.toLowerCase()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <label className={`block text-sm font-semibold mb-1 ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
        isNightMode
          ? 'bg-gray-800 border-gray-700 focus-within:border-primary-500'
          : 'bg-white border-gray-200 focus-within:border-primary-500'
      }`}>
        <MapPin className={`w-5 h-5 flex-shrink-0 ${value ? 'text-primary-500' : 'text-gray-400'}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-sm ${
            isNightMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-xl shadow-lg border overflow-hidden ${
            isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {suggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                isNightMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationSearch;
