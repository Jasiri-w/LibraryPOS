import Header from '../../components/Header';
import { prisma } from '../../prisma/client'
import { useRouter } from 'next/router';
import { Image } from 'next/image';
import Head from 'next/head';
import Link from 'next/link';

export default function BookDetails({ book, total_copies, available_copies }) {
  return (
    <div>
      <Head>  
        <title>{book.title} - Book Details</title>
        <meta name="description" content={`Details about the book: ${book.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white dark:bg-slate-800 dark:text-slate-400 pt-10 md:px-20 h-screen">
        <Header />
        <div className="content dark:bg-slate-800">
          <h1 className="text-center dark:text-white text-4xl font-bold my-4">{book.title}</h1>
          <div className="book-details-container flex flex-row gap-6 mx-auto p-6">
            {/* Left Column: Book Photo */}
            <div className="book-photo flex-1">
              <img
                src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
                alt={`${book.title} cover`}
                className="rounded-lg shadow-md w-full"
                style={{ maxHeight: "70vh", objectFit: "cover" }} 
              />
            </div>

            {/* Right Column: Book Information */}
            <div className="book-info flex-1">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">{book.title} ({book.publish_date})</h2>
              <h2 className="text-1xl mb-4">{book.subtitle}</h2>
              <p className="text-lg mb-2">
                <strong>Author:</strong> {book.author}
              </p>
              <p className="text-lg mb-2">
                <strong>ISBN:</strong> {book.isbn}
              </p>
              <p className="text-lg mb-2">
                <strong># of Pages:</strong> {book.number_of_pages}
              </p>
              <p className="text-lg mb-2">
                <strong>Format:</strong> {book.format}
              </p>
              <p className="text-lg mb-2">
                  <strong>Available Copies:</strong> {available_copies} / {total_copies} 
              </p>
              {/* <p className="text-lg mb-2">
                <strong>Published:</strong> {book.published_date}
              </p> */}
              <p className="text-lg">
                <strong>Description:</strong> {book.description || 'No description available.'}
              </p>
              <a
                href={`https://openlibrary.org${book.oid}`}
                className="text-blue-500 hover:underline mt-4 block"
                target="_blank"
                rel="noopener noreferrer"
              >
                View More details
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          .book-details-container {
            max-width: 1200px;
          }

          @media (max-width: 768px) {
            .book-details-container {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params; // Access the dynamic route parameter directly

  // Fetch the book details by ID
  const book = await prisma.book.findUnique({
    where: { id: parseInt(id) },
    include: {
      Copies: true,
    },
  });

    

  if (!book) {
    return {
      notFound: true,
    };
  }

  const total_copies = book.Copies.length;
  const available_copies = book.Copies.filter((copy) => copy.status === "Available").length;

  if (book.isbn) {
    try {
      const res = await fetch(`https://openlibrary.org/isbn/${book.isbn}.json`);
      if (res.ok) {
        const data = await res.json();
  
        // Assigning properties with safe fallbacks
        book.description = typeof data.description === 'string' 
          ? data.description 
          : data.description?.value || "No description available.";
  
        book.subtitle = data.subtitle || "No subtitle available.";
        book.publish_date = data.publish_date || "No publish date available.";
        book.dewey_decimal_class = Array.isArray(data.dewey_decimal_class) 
          ? data.dewey_decimal_class[0] 
          : "No classification available.";
        book.number_of_pages = data.number_of_pages || "No page count available.";
        book.oid = data.works[0].key || "No work key available.";
      } else {
        // Default values on fetch failure
        book.description = "No description available.";
        book.subtitle = "No subtitle available.";
        book.publish_date = "No publish date available.";
        book.dewey_decimal_class = "No classification available.";
        book.number_of_pages = "No page count available.";
        book.oid = "No work key available.";
      }
    } catch (error) {
      console.error("Failed to fetch book metadata:", error);
      book.description = "No description available.";
      book.subtitle = "No subtitle available.";
      book.publish_date = "No publish date available.";
      book.dewey_decimal_class = "No classification available.";
      book.number_of_pages = "No page count available.";
      book.oid = "No work key available.";
    }
  } else {
      book.description = "No ISBN available for description lookup.";
      book.subtitle = "No subtitle available.";
      book.publish_date = "No publish date available.";
      book.dewey_decimal_class = "No classification available.";
      book.number_of_pages = "No page count available.";
      book.oid = "No work key available.";
  }

  await prisma.$disconnect();
  return {
    props: {
      book,
      total_copies,
      available_copies,
    },
  };
}