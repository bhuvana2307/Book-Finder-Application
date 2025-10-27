import React, { useState, useEffect, useRef } from "react";

export default function Header({ onSearch, debounceMs = 400, placeholder = "Search books..." }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);

  // Call onSearch after debounceMs of inactivity
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!onSearch) return;

    // Don't search if query is empty
    if (!query.trim()) return;

    debounceRef.current = setTimeout(() => {
      onSearch(query.trim());
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, debounceMs, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch && onSearch(query.trim());
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Reduced height for mobile */}
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Left: Logo - Compact on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="#" className="flex items-center gap-2 sm:gap-3 no-underline group">
              {/* Logo - SH on mobile, full on desktop */}
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold shadow">
                <span className="text-sm sm:text-base">SH</span>
              </div>
              
              {/* Text - Hidden on small mobile, shown on larger screens */}
              <div className="hidden sm:flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-gray-800">StudyHub</span>
                <span className="text-xs text-gray-500 font-medium hidden lg:block">Book Finder</span>
              </div>
            </a>
          </div>

          {/* Center: Search - Takes most space on mobile */}
          <div className="flex-1 mx-2 sm:mx-4 lg:mx-6">
            <form onSubmit={handleSubmit} className="relative">
              <label htmlFor="book-search" className="sr-only">Search books</label>

              <div className={`flex items-center rounded-lg sm:rounded-xl border ${isFocused ? 'border-indigo-400 shadow-sm' : 'border-gray-200'} bg-white px-2 sm:px-3 py-1 sm:py-2`}> 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
                </svg>

                <input
                  id="book-search"
                  type="search"
                  className="w-full outline-none bg-transparent text-sm text-gray-800 placeholder-gray-500"
                  placeholder={window.innerWidth < 640 ? "Search..." : placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  aria-label="Search books"
                />

                {/* Clear button - only show when there's text */}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="ml-1 sm:ml-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}

                {/* Submit button (visible on larger screens) */}
                <button 
                  type="submit" 
                  className="ml-2 sm:ml-3 hidden sm:inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-indigo-600 text-white text-xs sm:text-sm font-medium hover:opacity-95 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Submit button for small screens (floating) - Simplified */}
              <button 
                type="submit" 
                className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-indigo-600 text-white text-xs font-medium shadow-sm"
              >
                Go
              </button>
            </form>
          </div>

          {/* Right: Help link - Hidden on very small screens */}
          <div className="flex items-center">
            <a 
              href="#" 
              className="hidden xs:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Help</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}