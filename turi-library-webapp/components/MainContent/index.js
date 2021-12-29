
import { useState } from 'react';

import DueBooks from '../DueBooks';

const MainContent = (props) => {
    return (
        <>
            <div className="dashboard-container justify-center">
                <BookExchange/>
                <DueBooks db_data={props.db_data}/>
            </div>
            <div className="dashboard-container">
                <AllBooks/>
            </div>
        </>
    );
};


const BookExchange = () => {
    return (
        <div className="card-container ">
            <h1 className="text-center text-black mb-3">Sign Out | Return Book</h1>
            <div className="grid grid-cols-2 gap-6">
                <label className="block">
                    <span className="text-gray-700">Student ID</span>
                    <input type="text" className="mt-1 block w-full" placeholder="123456789"/>
                </label>
                <label className="block">
                    <span className="text-gray-700 block">Student Name</span>
                    <span className="text-gray-700 block">Student Boarding House</span>
                </label>
                <label className="block">
                    <span className="text-gray-700">Book Barcode</span>
                    <input type="text" className="mt-1 block w-full" placeholder="123456789"/>
                </label>
                <label className="block">
                    <span className="text-gray-700">Title</span>
                    <input type="text" className="mt-1 block w-full" placeholder="Of Mice and Men"/>
                </label>
                <label className="block">
                    <span className="text-gray-700">Author</span>
                    <input type="text" className="mt-1 block w-full" placeholder="John Steinbeck"/>
                </label>
                <label className="block">
                    <span className="text-gray-700">Additional details</span>
                    <textarea className="mt-1 block w-full" rows="3"></textarea>
                </label>
            </div>
        </div>
    );
};



const AllBooks = () => {
    const [books, setBooks] = useState([]);
    const fetchBooks = async () => {
        const response = await fetch('/api/books');
        const data = await response.json();
        console.table(data);
        setBooks(data);
    }
    return (
        <div className="split card-container">
            <h1 className="text-center text-8xl text-black">All Books</h1>
            <button onClick={fetchBooks}>Load Books</button>
            <div className="book-list mx-auto ">
                <ol>
                    {
                        books.map(book => {
                            return (
                                <li key={book.Barcode} >
                                    <span className=" font-extrabold ">{book.Barcode}.</span> - {book.Title} by {book.Author}
                                </li>
                            )
                        })
                    }
                </ol>
            </div>
        </div>
    );
};

export default MainContent;