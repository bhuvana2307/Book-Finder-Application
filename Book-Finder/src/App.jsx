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
  }, [selectedBook]);

  const handleBookSelect = (book) => {
    
    setSelectedBook(book);
    setForceDetails(true);
  };

  const handleBackToList = () => {
    setSelectedBook(null);
    setForceDetails(false);
  };

  const handleSearch = (searchQuery) => {

    
    setQuery(searchQuery);
    
    // ONLY reset if we're not forcing details view
    if (!forceDetails) {
      console.log("Resetting selectedBook (not in details view)");
      setSelectedBook(null);
    } else {
      console.log("Keeping selectedBook (in details view)");
    }
  };

  // DECISION: What to render?
  const shouldShowDetails = selectedBook && forceDetails;
  // console.log("RENDER DECISION - Show Details:", shouldShowDetails);

  if (shouldShowDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={handleSearch} />
        <BookDetails book={selectedBook} onBack={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      <BookList query={query} onBookSelect={handleBookSelect} />
    </div>
  );
}