import React, { useEffect, useState, useCallback } from "react";

export default function BookList({ query, onBookSelect }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchType: "q", // Default to general search
    sortBy: "relevance",
    year: "",
    language: "",
    hasCover: false
  });
  const [availableFilters, setAvailableFilters] = useState({
    languages: [],
    years: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12); // 12 books per page

  // Build API URL based on search type
  const buildApiUrl = () => {
    if (!query.trim()) return null;

    const baseUrl = "https://openlibrary.org/search.json";
    const searchParam = encodeURIComponent(query);
    
    let url = baseUrl;
    
    // Different search types use different parameters
    switch (filters.searchType) {
      case "title":
        url += `?title=${searchParam}`;
        break;
      case "author":
        url += `?author=${searchParam}`;
        break;
    //   case "subject":
    //     url += `?subject=${searchParam}`;
    //     break;
      default: // "q" - general search
        url += `?q=${searchParam}`;
        break;
    }
    
    // Add limit - increased to get more books for pagination
    url += `&limit=200`;
    
    console.log("🔍 API URL:", url);
    return url;
  };

  // Fetch books based on query and filters
  const fetchBooks = useCallback(async () => {
    if (!query.trim()) {
      setBooks([]);
      setSearchExecuted(false);
      setCurrentPage(1); // Reset to first page
      return;
    }

    try {
      setLoading(true);
      setSearchExecuted(true);
      
      const url = buildApiUrl();
      if (!url) return;

      const res = await fetch(url);
      const data = await res.json();
      
      let results = data.docs || [];
      console.log(`Raw results: ${results.length} books found`);
      
      // Apply local filters
      results = applyLocalFilters(results);
      
      // Update available filter options
      updateAvailableFilters(results);
      
      setBooks(results);
      setCurrentPage(1); // Reset to first page when new search
      console.log(`Filtered results: ${results.length} books after filters`);
      
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  // Apply local filters (year, language, cover)
  const applyLocalFilters = (books) => {
    let filtered = [...books];
    
    console.log("Applying local filters:", filters);
    
    // Year filter
    if (filters.year) {
      filtered = filtered.filter(book => book.first_publish_year == filters.year);
      console.log(`After year filter (${filters.year}): ${filtered.length} books`);
    }
    
    // Language filter
    if (filters.language) {
      filtered = filtered.filter(book => 
        book.language?.includes(filters.language)
      );
      console.log(`After language filter (${filters.language}): ${filtered.length} books`);
    }
    
    // Cover filter
    if (filters.hasCover) {
      filtered = filtered.filter(book => book.cover_i);
      console.log(`After cover filter: ${filtered.length} books`);
    }
    
    // Sort results
    filtered.sort(getSortFunction(filters.sortBy));
    
    return filtered;
  };

  // Sort functions
  const getSortFunction = (sortBy) => {
    switch (sortBy) {
      case "newest":
        return (a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0);
      case "oldest":
        return (a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0);
      case "title":
        return (a, b) => (a.title || "").localeCompare(b.title || "");
      case "author":
        return (a, b) => (a.author_name?.[0] || "").localeCompare(b.author_name?.[0] || "");
      default: // relevance
        return () => 0;
    }
  };

  // Update available filter options from current results
  const updateAvailableFilters = (books) => {
    const languages = new Set();
    const years = new Set();
    
    books.forEach(book => {
      // Languages
      book.language?.forEach(lang => {
        if (lang && lang.trim()) {
          languages.add(lang);
        }
      });
      
      // Years
      if (book.first_publish_year) {
        years.add(book.first_publish_year);
      }
    });
    
    const sortedLanguages = Array.from(languages).sort();
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    console.log(`Available filters - Languages: ${sortedLanguages.length}, Years: ${sortedYears.length}`);
    
    setAvailableFilters({
      languages: sortedLanguages,
      years: sortedYears
    });
  };

  // Reset all filters
  const resetFilters = () => {
    console.log("Resetting all filters");
    setFilters({
      searchType: "q",
      sortBy: "relevance",
      year: "",
      language: "",
      hasCover: false
    });
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Fetch books when query or filters change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg w-full justify-center font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          {showFilters ? "Hide Filters" : "Show Filters"} 
          {Object.values(filters).filter(val => val && val !== "q" && val !== "relevance" && val !== false).length > 0 && (
            <span className="bg-white text-indigo-600 rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {Object.values(filters).filter(val => val && val !== "q" && val !== "relevance" && val !== false).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Sidebar */}
      <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-r border-gray-200 p-6 lg:p-6 overflow-y-auto max-h-screen`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Search & Filters</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Reset All
          </button>
        </div>

        {/* Search Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "q", label: "All" },
              { value: "title", label: "Title" },
              { value: "author", label: "Author" },
            //   { value: "subject", label: "Subject" }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => handleFilterChange("searchType", type.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filters.searchType === type.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Current: {filters.searchType === "q" ? "General Search" : filters.searchType.charAt(0).toUpperCase() + filters.searchType.slice(1) + " Search"}
          </p>
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="author">Author A-Z</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Publication Year
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
          >
            <option value="">All Years</option>
            {availableFilters.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        {availableFilters.languages.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Language
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.language}
              onChange={(e) => handleFilterChange("language", e.target.value)}
            >
              <option value="">All Languages</option>
              {availableFilters.languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cover Filter */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filters.hasCover}
              onChange={(e) => handleFilterChange("hasCover", e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Has Cover Image</span>
          </label>
        </div>

        {/* Active Filters Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Total Books: <span className="font-semibold text-gray-800">{books.length}</span>
          </p>
          <p className="text-sm text-gray-600">
            Showing: <span className="font-semibold text-gray-800">{currentBooks.length}</span> on page {currentPage}
          </p>
          {filters.searchType !== "q" && (
            <p className="text-xs text-gray-500 mt-1">
              Searching by: <span className="font-medium">{filters.searchType}</span>
            </p>
          )}
          {(filters.year || filters.language || filters.hasCover) && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600">Active filters:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.year && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Year: {filters.year}</span>
                )}
                {filters.language && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Lang: {filters.language}</span>
                )}
                {filters.hasCover && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">With Cover</span>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Book Results */}
      <main className="flex-1 p-4 lg:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching books...</p>
              <p className="text-sm text-gray-400 mt-1">
                {filters.searchType !== "q" ? `Searching by ${filters.searchType}` : "General search"}
              </p>
            </div>
          </div>
        ) : books.length === 0 && searchExecuted ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">
              {filters.year ? `No books found from year ${filters.year}` :
               "Try adjusting your search or filters"}
            </p>
            <button
              onClick={resetFilters}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for books</h3>
            <p className="text-gray-600">Enter a title, author, or subject to find books</p>
          </div>
        ) : (
          <>
            {/* Mobile Results Info */}
            <div className="lg:hidden bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{books.length}</span> total books
                  </p>
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(true)}
                  className="text-indigo-600 text-sm font-medium"
                >
                  Filters
                </button>
              </div>
            </div>

            {/* Desktop Results Info */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Search Results for "{query}"
                </h2>
                <p className="text-gray-600">
                  Showing {currentBooks.length} of {books.length} books (Page {currentPage} of {totalPages})
                </p>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentBooks.map((book) => (
                <div
                  key={book.key}
                  onClick={() => onBookSelect(book)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={
                        book.cover_i
                          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                          : "https://via.placeholder.com/300x400?text=No+Cover"
                      }
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!book.cover_i && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">📖</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {book.author_name?.join(", ") || "Unknown Author"}
                    </p>
                    
                    {book.first_publish_year && (
                      <p className="text-xs text-gray-500 mb-3">
                        Published: {book.first_publish_year}
                      </p>
                    )}

                    {book.subject && book.subject.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {book.subject.slice(0, 2).map((subject, index) => (
                          <span
                            key={index}
                            className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full"
                          >
                            {subject.length > 20 ? subject.substring(0, 20) + "..." : subject}
                          </span>
                        ))}
                        {book.subject.length > 2 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{book.subject.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, books.length)} of {books.length} books
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                          currentPage === number
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}