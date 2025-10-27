import React, { useEffect, useState } from "react";

export default function BookDetails({ book, onBack }) {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("BOOKDETAILS COMPONENT MOUNTED");
  console.log("Received book:", book);
  console.log("Book key:", book?.key);

  useEffect(() => {
    if (!book) {
      console.log("No book provided to BookDetails");
      setLoading(false);
      return;
    }

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract work ID from book key
        const workId = book.key.replace("/works/", "");
        console.log("Fetching details for work ID:", workId);
        
        const response = await fetch(`https://openlibrary.org/works/${workId}.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Successfully fetched book details");
        console.log("Book details data:", data);
        setBookDetails(data);
        
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [book]);

  // Show error if no book is provided
  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Book Selected</h2>
          <p className="text-gray-600 mb-6">Please go back and select a book.</p>
          <button
            onClick={onBack}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-indigo-200 mb-6 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Search Results
          </button>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Book Cover */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <img
                src={
                  book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                    : "https://via.placeholder.com/300x400?text=No+Cover"
                }
                alt={book.title}
                className="w-48 h-64 lg:w-56 lg:h-80 object-cover rounded-lg shadow-2xl border-4 border-white"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x400?text=No+Cover";
                }}
              />
            </div>
            
            {/* Book Basic Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
                {book.title}
              </h1>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold opacity-90 mb-2">Author(s)</h3>
                  <p className="text-xl">
                    {book.author_name?.join(", ") || "Unknown Author"}
                  </p>
                </div>
                
                {book.first_publish_year && (
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-2">First Published</h3>
                    <p className="text-xl">{book.first_publish_year}</p>
                  </div>
                )}

                {book.publisher && book.publisher.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-2">Publisher</h3>
                    <p className="text-xl">{book.publisher[0]}</p>
                  </div>
                )}

                {book.isbn && book.isbn.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-2">ISBN</h3>
                    <p className="text-xl font-mono">{book.isbn[0]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading book details...</p>
            <p className="text-gray-400 text-sm mt-2">Fetching from Open Library</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Couldn't Load Additional Details</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600">
              But don't worry! We still have the basic book information below.
            </p>
          </div>
        </div>
      )}

      {/* Book Details Content */}
      {!loading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Description - Full Width if no other content */}
            {(bookDetails?.description || book.subject) && (
              <div className={book.subject ? "lg:col-span-2" : "lg:col-span-3"}>
                {bookDetails?.description && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {typeof bookDetails.description === 'string' 
                          ? bookDetails.description 
                          : bookDetails.description?.value || "No description available"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Info from BookDetails */}
                {bookDetails && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {bookDetails.first_publish_date && (
                        <div>
                          <span className="font-semibold text-gray-700">First Published: </span>
                          <span className="text-gray-800">{bookDetails.first_publish_date}</span>
                        </div>
                      )}
                      {bookDetails.latest_revision && (
                        <div>
                          <span className="font-semibold text-gray-700">Last Updated: </span>
                          <span className="text-gray-800">{bookDetails.latest_revision}</span>
                        </div>
                      )}
                      {bookDetails.subjects && (
                        <div className="md:col-span-2">
                          <span className="font-semibold text-gray-700">Total Subjects: </span>
                          <span className="text-gray-800">{bookDetails.subjects.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Subjects from original book data */}
              {book.subject && book.subject.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Subjects & Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.subject.slice(0, 15).map((subject, index) => (
                      <span
                        key={index}
                        className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100"
                      >
                        {subject.length > 25 ? subject.substring(0, 25) + "..." : subject}
                      </span>
                    ))}
                  </div>
                  {book.subject.length > 15 && (
                    <p className="text-gray-500 text-sm mt-3">
                      +{book.subject.length - 15} more subjects
                    </p>
                  )}
                </div>
              )}

              {/* Book Identifiers */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Book Identifiers</h3>
                <div className="space-y-3 text-sm">
                  {book.isbn?.[0] && (
                    <div>
                      <span className="font-semibold text-gray-700">ISBN: </span>
                      <span className="text-gray-800 font-mono">{book.isbn[0]}</span>
                    </div>
                  )}
                  {book.language?.[0] && (
                    <div>
                      <span className="font-semibold text-gray-700">Language: </span>
                      <span className="text-gray-800">{book.language[0].toUpperCase()}</span>
                    </div>
                  )}
                  {book.key && (
                    <div>
                      <span className="font-semibold text-gray-700">Open Library ID: </span>
                      <span className="text-gray-800 font-mono text-xs">{book.key}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {/* <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Save to Reading List
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Copy Citation
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Find in Library
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}