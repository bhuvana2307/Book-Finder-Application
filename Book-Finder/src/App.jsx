import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import BookList from "./components/BookList";
import BookDetails from "./components/BookDetails";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [forceDetails, setForceDetails] = useState(false);

  // console.log("=== APP RENDER ===");
  // console.log("Selected Book:", selectedBook ? "YES - " + selectedBook.title : "NO");
  // console.log("Force Details:", forceDetails);
  // console.log("Query:", query);

  useEffect(() => {
    console.log("🔄 SELECTED BOOK CHANGED:", selectedBook ? selectedBook.title : "null");
  }, [selectedBook]);

  const handleBookSelect = (book) => {
    // console.log("🟢 ========== BOOK SELECTED ==========");
    // console.log("🟢 Book:", book.title);
    // console.log("🟢 Setting selectedBook and forceDetails to true");
    setSelectedBook(book);
    setForceDetails(true);
  };

  const handleBackToList = () => {
    // console.log("🔙 ========== BACK TO LIST ==========");
    setSelectedBook(null);
    setForceDetails(false);
  };

  const handleSearch = (searchQuery) => {
    // console.log("🔍 ========== SEARCH TRIGGERED ==========");
    // console.log("🔍 Search Query:", searchQuery);
    // console.log("🔍 Current selectedBook:", selectedBook ? selectedBook.title : "null");
    // console.log("🔍 Current forceDetails:", forceDetails);
    
    setQuery(searchQuery);
    
    // ONLY reset if we're not forcing details view
    if (!forceDetails) {
      console.log("🔍 Resetting selectedBook (not in details view)");
      setSelectedBook(null);
    } else {
      console.log("🔍 Keeping selectedBook (in details view)");
    }
  };

  // DECISION: What to render?
  const shouldShowDetails = selectedBook && forceDetails;
  // console.log("🎯 RENDER DECISION - Show Details:", shouldShowDetails);

  if (shouldShowDetails) {
    // console.log("📖 ========== RENDERING BOOK DETAILS ==========");
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={handleSearch} />
        <BookDetails book={selectedBook} onBack={handleBackToList} />
      </div>
    );
  }

  // console.log("📚 ========== RENDERING BOOK LIST ==========");
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      <BookList query={query} onBookSelect={handleBookSelect} />
    </div>
  );
}