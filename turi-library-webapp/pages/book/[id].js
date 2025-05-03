import Header from '../../components/Header';
import { PrismaClient } from '@prisma/client';
import { useRouter } from 'next/router';
import { Image } from 'next/image';

export default function BookDetails({ book, total_copies, available_copies }) {
  return (
    <div>
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
              <h2 className="text-2xl font-bold mb-4 dark:text-white">{book.title}</h2>
              <p className="text-lg mb-2">
                <strong>Author:</strong> {book.author}
              </p>
              <p className="text-lg mb-2">
                <strong>ISBN:</strong> {book.isbn}
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
    const prisma = new PrismaClient();

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

    return {
        props: {
            book,
            total_copies,
            available_copies,
        },
    };
}