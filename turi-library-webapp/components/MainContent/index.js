import { useState } from 'react';
import Link from 'next/link';

import DueBooks from '../DueBooks';

const MainContent = (props) => {
    return (
        <>
            <ExchangeRow db_data={props.db_data} students={props.db_data.students} books={props.db_data.books} />
            {/**<DueBooks  checkouts={checkouts} setCheckout={setCheckout}/>**/}
            {/**<div className="dashboard-container">
                <AllBooks/>
    </div>*/}
        </>
    );
};


const ExchangeRow = (props) => {
    const [checkouts, setCheckout] = useState(props.db_data.checkouts);
    const [inputs, setInputs] = useState({
        student_id: "",
    });
    const [students, setStudents] = useState(props.students)
    const [books, setBooks] = useState(props.books)
    const [student_information, setStudentInformation] = useState({
            holdings: {
                id: "",
                first_name: "",
                last_name: "",
                boarding_house: "",
            },
        })
    const [book_information, setBookInformation] = useState({
            holdings: {
                id: "",
                title: "",
                author: "",
                barcode: "",
                isbn: "",
                format: "",
                total_copies: 0,
                available_copies: 0,
            },
        })

    const handleChangeStudent = (event) => {
        const name = event.target.name;
        const idvalue = event.target.value;
        setInputs(values => ({...values, [name]: idvalue}));

        var holdings = {}
        for(var x=0;x<students.length;x++){
            if(students[x].id==idvalue){
                holdings=students[x];
                break;
            }
        }
        if(holdings==undefined){
            holdings = {
                id: "",
                first_name: "",
                last_name: "",
                boarding_house: "",
            }
        }
        
        setStudentInformation(values => ({holdings}));

    }
    
    const handleChangeBook = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));

        if (name === "barcode") {
            // Find the BookCopy by barcode
            const bookCopy = books
                .flatMap((book) => book.Copies || []) // Ensure Copies is an array
                .find((copy) => copy.barcode === value);
        

            if (bookCopy) {
                // Populate title and author based on the BookCopy's bookId
                const book = books.find((b) => b.id === bookCopy.bookId);
                if (book) {
                    setInputs((values) => ({
                        ...values,
                        title: book.title,
                        author: book.author,
                    }));
                    const availableCount = book.Copies.filter((copy) => copy.status.toLowerCase() === "available").length;
                    const totalCount = book.Copies.length;
                    setBookInformation({ holdings: { ...bookCopy, title: book.title, author: book.author, isbn: book.isbn, format: book.format, total_copies: totalCount, available_copies: availableCount} });
                }else{
                    setInputs((values) => ({
                        ...values,
                        title: "",
                        author: "",
                    }));
                }
            } else {
                setInputs((values) => ({
                    ...values,
                    title: "",
                    author: "",
                }));
                console.log("No matching barcode found.");
            }
        }else if (name === "title") {
            // Find the BookCopy by title name
            const book = books.find((b) => b.title.toLowerCase() === value.toLowerCase());

            if (book) {
                const availableCount = book.Copies.filter((copy) => copy.status.toLowerCase() === "available").length;
                const totalCount = book.Copies.length;
                const nearestAvailableCopy = book.Copies.find((copy) => copy.status.toLowerCase() === "available");
                if (nearestAvailableCopy) {
                    setInputs((values) => ({
                        ...values,
                        barcode: nearestAvailableCopy.barcode,
                        author: book.author,
                    }));
                    setBookInformation({ holdings: { ...nearestAvailableCopy, title: book.title, author: book.author, isbn: book.isbn, format: book.format, total_copies: totalCount, available_copies: availableCount} });
                }else{
                    setInputs((values) => ({
                        ...values,
                        barcode: "",
                        author: book.author,
                    }));
                    console.log("All copies are currently checked out.");
                    setBookInformation({ holdings: {...book, title: book.title, author: book.author, isbn: book.isbn, format: book.format, total_copies: totalCount, available_copies: availableCount} });
                }
            } else {
                console.log("No matching book found.");
            }
        }else if (name === "author") {
            // Find the BookCopy by title name
            const book = books.find((b) => b.author.toLowerCase() === value.toLowerCase());

            if (book) {
                const availableCount = book.Copies.filter((copy) => copy.status.toLowerCase() === "available").length;
                const totalCount = book.Copies.length;
                const nearestAvailableCopy = book.Copies.find((copy) => copy.status.toLowerCase() === "available");
                if (nearestAvailableCopy) {
                    setInputs((values) => ({
                        ...values,
                        barcode: nearestAvailableCopy.barcode,
                        title: book.title,
                    }));
                    setBookInformation({ holdings: { ...nearestAvailableCopy, title: book.title, author: book.author, isbn: book.isbn, format: book.format, total_copies: totalCount, available_copies: availableCount} });
                }else{
                    setInputs((values) => ({
                        ...values,
                        barcode: "",
                        title: ""
                    }));
                    console.log("All copies are currently checked out.");
                    setBookInformation({ holdings: {...book, title: book.title, author: book.author, isbn: book.isbn, format: book.format, total_copies: totalCount, available_copies: availableCount} });
                }
            } else {
                console.log("No matching book found.");
            }
        }

        console.log("Inputs:", inputs);
        console.log("Book Information:", book_information);
    };

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    async function saveCheckout(checkout){
        const response = await fetch('/api/checkouts', {
          method: 'POST',
          body: JSON.stringify(checkout)
        });
        if(!response.ok){
          throw new Error(response.statusText);
        }
      
        return await response.json();
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        var student_id = formData.get('student_id');
        var available_copy = books.find((b) => b.id === book_information.holdings.id).Copies.find((copy) => copy.status.toLowerCase() === "available");

        if (!available_copy) {
            console.log("No available copy found for this book.");
            return; // Exit early if no available copy is found
        }

        const new_checkout = {
            Student: {
                connect: { id: student_information.holdings.id }, // Connect the checkout to the existing Student
            },
            BookCopy: {
                connect: { id: available_copy.id }, // Connect the checkout to the available BookCopy
            },
        };

        console.log("Form Submitted");
        console.log("New Checkout:", new_checkout);

        try {
            const saved = await saveCheckout(new_checkout);

            // Add the new checkout to the frontend state with the correct structure
            const new_checkout_frontend = {
                id: parseInt(saved.id),
                Student: {
                    first_name: student_information.holdings.first_name,
                    last_name: student_information.holdings.last_name,
                },
                BookCopy: {
                    Book: {
                        title: book_information.holdings.title,
                        author: book_information.holdings.author,
                    },
                },
                checkout_date: new Date().toISOString(), // Add the current date as the checkout date
            };

            event.target.reset();
            setCheckout(checkouts.concat(new_checkout_frontend));
            setBookInformation((prev) => {
                return {
                    ...prev,
                    holdings: {
                        ...prev.holdings,
                        available_copies: (prev.holdings.available_copies || 0) - 1,
                    },
                };
            });
            console.log("Number of available copies reduced:", book_information.holdings.available_copies);
            console.log("Book Information:", book_information);
            event.target.querySelector("input[name='student_id']").value = student_id;
            event.target.querySelector("input[name='student_id']").focus();
        } catch (err) {
            console.log(err);
        }
    }

    const deleteCheckout = async (checkout_id) => {
        const requestString = '/api/deleteCheckout/' + checkout_id;
        const response = await fetch(requestString, {
          method: 'POST',
        });
        if(!response.ok){
          throw new Error(response.statusText);
        }
      
        return await response.json();
    }

    const handleDelete = async (event) => {
        const checkout_id = event.target.id;

        try {
            const deleted = await deleteCheckout(checkout_id);

            // Update the checkouts state by removing the deleted checkout
            setCheckout(checkouts.filter(record => record.id !== parseInt(checkout_id)));

            // Update the available copies count for the corresponding book
            setBookInformation((prev) => {
                if (deleted.BookCopy && prev.holdings.id === deleted.BookCopy.bookId) {
                    return {
                        ...prev,
                        holdings: {
                            ...prev.holdings,
                            available_copies: prev.holdings.available_copies + 1,
                        },
                    };
                }
                return prev;
            });
        } catch (err) {
            console.log(err);
        }
    };

    const dateify = (date) => {
        if(date == undefined){
            return " just now ...";
        }else{
            return date.substring(0,10);
        }
    }

    const clearInputs = () => {
        //setInputs(values => ({...values, ["student_id"]: ""}));
        setInputs(values => ({...values, ["barcode"]: ""}));
        setInputs(values => ({...values, ["title"]: ""}));
        setInputs(values => ({...values, ["author"]: ""}));
    }

    //console.log("Books:", books);
    console.log("Checkouts:", checkouts);
    console.log("Book Information:", book_information);

    return (
        <div className=" ">
            <div className="dashboard-container justify-center">
                <form className="split "id="exchange_form" onSubmit={handleSubmit}>
                    <div className="card-container ">
                        <h1 className="">Check Out | Return Book</h1>
                        <div className="grid grid-cols-2 gap-6" id="book-form-grid">
                            <label className="block">
                                <span className="text-gray-700 dark:text-slate-400">Student ID</span>
                                <input required name="student_id" type="text" className="field" placeholder="123456789" value={inputs.student_id || ""} onChange={handleChangeStudent}/>
                            </label>
                            <label className="block my-auto text-center pt-4">
                                <span className="text-gray-700 text-2xl font-bold inline-block dark:text-white">{student_information.holdings.first_name || ""} {student_information.holdings.boarding_house || ""}</span>
                            </label>
                            <label className="block">
                                <span className="text-gray-700 dark:text-slate-400">Book Barcode</span>
                                <input required name="barcode" value={inputs.barcode || ""} onChange={handleChangeBook} type="text" className="field" placeholder="123456789"/>
                            </label>
                            <label className="block">
                                <span className="text-gray-700 dark:text-slate-400">Title</span>
                                <input required name="title" onChange={handleChangeBook} value={inputs.title || ""} type="text" className="field" placeholder="Of Mice and Men" />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 dark:text-slate-400">Author</span>
                                <input required name="author" value={inputs.author || ""} onChange={handleChangeBook} type="text" className="field" placeholder="John Steinbeck"/>
                            </label>
                            <span className="block align-middle text-right pt-4">
                                <input type ="submit" value="Checkout" className="mx-2" disabled={book_information.barcode === "" || book_information.title === ""}></input>
                                <input type ="reset" value="Clear" className="mx-2" onClick={clearInputs}></input>
                            </span>
                        </div>
                    </div>
                </form>
                <div className="split card-container flex justify-between book-info-home">
                    {book_information.holdings.isbn === "" ? (
                        <div className="flex flex-col items-center justify-center h-full w-full text-center">
                            <div className="text-4xl text-gray-500 italic mb-8">Scan a book or enter a Title!</div>
                            <Link href="/all-books" className="button">Explore!</Link>
                        </div>
                    ) : (
                        <div className="">
                            <h2 className="text-2xl font-bold mb-4">{book_information.holdings.title}</h2>
                            <p className="text-lg mb-2">
                                <strong>Author:</strong> {book_information.holdings.author}
                            </p>
                            <p className="text-lg mb-2">
                                <strong>ISBN:</strong> {book_information.holdings.isbn}
                            </p>
                            <p className="text-lg mb-2">
                                <strong>Format:</strong> {book_information.holdings.format}
                            </p>
                            <p className="text-lg mb-2">
                                <strong>Available Copies:</strong> {book_information.holdings.available_copies} / {book_information.holdings.total_copies}
                            </p>
                            <Link
                                className="transition-all duration-100 delay-50 hover:text-emerald-500 text-emerald-700"
                                href={`/book/${book_information.holdings.id}`}
                                passHref
                            >
                                View More
                            </Link>
                        </div>
                    )}
                    <img style={{ display : book_information.holdings.isbn !== "" ? 'block' : 'none'}} className='rounded-lg  object-cover' src={book_information.holdings.isbn !== "" ? `https://covers.openlibrary.org/b/isbn/${book_information.holdings.isbn}-M.jpg` : ""}/>
                </div>
            </div>
            <div>
                <div className="flex-col">
                    <div className="card-container">
                        <h1 className="text-center text-8xl text-black">Books Checked Out ({checkouts.length})</h1>
                        <div className="book-list mx-auto">
                            <ol>
                                {
                                    checkouts.length === 0 ? <li className="text-center">No books checked out! Happy Reading!</li> :
                                    checkouts.map(check =>{
                                        console.log("Check:", check);
                                        return(
                                            <li className="checkout-elem" onClick={handleDelete} id={check.id} key={check.id}> {check.Student.first_name} {check.Student.last_name} - {check.BookCopy.Book.title} by {check.BookCopy.Book.author} - Since {dateify(check.checkout_date)} </li>
                                        );
                                    })
                                }
                            </ol>
                        </div>
                    </div>
                    {/* <div className="link-container">
                        <Link href="/all-books" className="link">
                            All Books
                        </Link>
                        <p className="link">Checkout Log</p>
                    </div> */}
                </div>
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
            <div id="allbooks" className="book-list mx-auto ">
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