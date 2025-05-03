import Header from '../components/Header';
import { prisma } from '../prisma/client'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';

export default function AllBooks({ books, bookAvailability, bookRequests }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  let debounceTimeout;
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = async (query) => {
    if (!query) {
      return;
    }

    try {
      const url = `https://openlibrary.org/search.json?q=${query}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.docs) {
        setSearchResults(data.docs.slice(0, 10)); // Limit to 10 results
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      // setSearchResults([]); // Clear results on error
    }
  };

  const debouncedHandleSearch = debounce(handleSearch, 300);

  const handleBookRequest = async (title, author, olid) => {
    try {
      const response = await fetch('/api/book-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, olid }),
      });

      if (response.ok) {
        console.log('Book request submitted successfully!');
      } else {
        console.log('Failed to submit book request.');
      }
    } catch (error) {
      console.error('Error submitting book request:', error);
    }
    
  };

  const isBookInLibrary = (title, author) => {
    return books.some(
      (book) => book.title.toLowerCase() === title.toLowerCase() && book.author.toLowerCase() === author.toLowerCase()
    );
  };

  const isBookAlreadyRequested = (title, author, olid) => {
    return bookRequests.some(
      (book) => book.title.toLowerCase() === title.toLowerCase() && book.author.toLowerCase() === author.toLowerCase() && book.olid === olid
    );
  };

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 dark:text-slate-400 pt-10 ;">
        <div className='w-full'>
          <Header />
          <div className="content dark:bg-slate-800 mt-8">
            {/* Section for Exploring Books in the Library */}
            <h1 className=" text-center text-5xl font-bold mb-4 dark:text-white">Explore</h1>
            <h2 className=" text-center text-1xl font-bold mb-4 dark:text-slate-500">Browse everything in your library&apos;s catalog!</h2>
            <div className="all-book-list mx-auto  mt-4 mb-8 mx-5" >
              <ul>
                {books.map((book) => (
                  <li
                    key={book.id}
                    className="my-2 book-item transition duration-500 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundImage: `url(https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg)`,
                    }}
                    onClick={() => router.push(`/book/${book.id}`)}
                  >
                    <Link
                      className="block p-4 transition duration-300 ease-in-out hover:bg-white/30 hover:backdrop-blur-xs rounded-lg dark:text-white"
                      href={`/book/${book.id}`}
                      legacyBehavior>
                        <span>
                          <strong>{book.title}</strong> by {book.author} (ISBN: {book.isbn}, Format: {book.format})
                          <span className="availability-tooltip">
                            {bookAvailability[book.id]} copy(ies) available
                          </span>
                        </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section for Searching External Books */}
            <div id="search-section" className="search-section flex flex-wrap flex-col pt-12 dark:bg-slate-700" style={{ boxShadow: "rgba(16, 185, 129, 0.2) 0px 9px 20px 0px inset" }}>
              <h1 className="text-center text-4xl font-bold my-4 dark:text-white ">Search Global Catalog Books</h1>
              <h2 className=" text-center text-1xl font-bold mb-4 dark:text-slate-500">Recommend something new for the community!</h2>

              {/* Left: Search Bar */}
              <div className=" p-4 mx-auto">
                <input
                  type="text"
                  placeholder="Search for books..."
                  className="w-full p-2 border rounded"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedHandleSearch(e.target.value);
                  }}
                />
              </div>

              {/* Right: Search Results */}
              <div className="search-results w-full p-4">
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((result, index) => (
                      <li key={index} className="my-2 p-4 border rounded shadow flex justify-between search-result-item dark:text-white mx-auto transition duration-300 ease-in-out hover:bg-black/20 hover:backdrop-blur-xs dark:hover:bg-white/50 dark:hover:backdrop-blur-xs">
                        <span className='flex'>
                          {/* Book Cover Image */}
                          <Image
                            src={`https://covers.openlibrary.org/b/id/${result.cover_i}-M.jpg`}
                            alt={`${result.title} cover`}
                            width={96} // Adjust width as needed
                            height={96} // Adjust height as needed
                            className="w-24 h-24 rounded-md mr-4 float-left"
                            onError={(e) => (e.target.style.display = 'none')} // Hide image if not found
                          />
                          {/* Book Details */}
                          <span className="my-auto">
                            {/* Book Title and Author */}
                            <strong>{result.title}</strong> by {result.author_name?.join(', ') || 'Unknown Author&apos;s'}
                            <span className="ml-2 italic text-blue-500 transition-all duration-300 ease-in transition-delay-100 hover:ml-4">
                              <a
                                href={`https://openlibrary.org${result.key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                - More details
                              </a>
                            </span>
                          </span>
                        </span>
                        <div className='my-auto'>
                          {isBookInLibrary(result.title, result.author_name?.[0]) ? (
                            <span className="text-green-500">It&apos;s already in our library!</span>
                          ) : isBookAlreadyRequested(result.title, result.author_name?.[0], result.key.split('/')[1]) ? (
                            <span className="text-yellow-500">This has already been requested!</span>
                          ) : (
                            <button
                              className=""
                              onClick={() =>
                                handleBookRequest(result.title, result.author_name?.[0], result.key.split('/')[2])
                              }
                            >
                              Request This Book
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-center'>No results found. Try searching for a book.</p>
                )}
              </div>
            </div>
          </div>

          <style jsx>{`
            .search-result-item {
              width:80%;
            }
            @media (max-width: 768px) {
              .search-section {
                flex-direction: column;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {

  // Fetch all books and their copies
  const books = await prisma.book.findMany({
    include: {
      Copies: true,
    },
  });

  // Calculate the number of available copies for each book
  const bookAvailability = books.reduce((acc, book) => {
    acc[book.id] = book.Copies.filter((copy) => copy.status === 'Available').length;
    return acc;
  }, {});

  const bookRequests = (await prisma.bookRequest.findMany()) || [];
  const serializedBookRequests = bookRequests.map((request) => ({
    ...request,
    requestDate: request.requestDate.toISOString(), // Convert Date to string
  }));

  // Remove the Copies array from the books to avoid sending unnecessary data
  const sanitizedBooks = books.map(({ Copies, ...rest }) => rest);
  await prisma.$disconnect();
  return {
    props: {
      books: sanitizedBooks,
      bookAvailability,
      bookRequests: serializedBookRequests
    },
  };
}