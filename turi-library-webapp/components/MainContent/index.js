
import { useState } from 'react';

import DueBooks from '../DueBooks';

const MainContent = (props) => {

    return (
        <>
            <div className="dashboard-container justify-center">
                <BookExchange students={props.db_data.students} books={props.db_data.books}/>
                <DueBooks db_data={props.db_data}/>
            </div>
            <div className="dashboard-container">
                <AllBooks/>
            </div>
        </>
    );
};


const BookExchange = (props) => {

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
        const barcode = event.target.value;
        setInputs(values => ({...values, [name]: barcode}));

        var holdings = {}
        for(var x=0;x<books.length;x++){
            if(books[x].barcode==barcode){
                holdings=books[x];
                break;
            }
        }
        console.log(holdings)

        

        setInputs(values => ({...values, ["author"]: holdings.author}));
        setInputs(values => ({...values, ["title"]: holdings.title}));
        setBookInformation(values => ({holdings}));

    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    async function saveCheckout(checkout){
        const response = await fetch('/api/checkouts', {
          method: 'POST',
          body: JSON.stringify(contact)
        });
        if(!response.ok){
          throw new Error(response.statusText);
        }
      
        return await response.json();
    }

    const handleSubmit = async (event, data) => {
        console.table(data);
        alert(data.student_id);
        event.preventDefault();
        /**try{
            await saveCheckout(data);
            event.target.reset();
        } catch (err) {
            console.log(err);
        }**/
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="card-container ">
                <h1 className="text-center text-black mb-3">Sign Out | Return Book</h1>
                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-gray-700">Student ID</span>
                        <input name="student_id" type="text" className="mt-1 block w-full" placeholder="123456789" value={inputs.student_id || ""} onChange={handleChangeStudent}/>
                    </label>
                    <label className="block">
                        <span className="text-gray-700 block">{student_information.holdings.first_name || ""}</span>
                        <span className="text-gray-700 block">{student_information.holdings.boarding_house || ""}</span>
                    </label>
                    <label className="block">
                        <span className="text-gray-700">Book Barcode</span>
                        <input name="barcode" value={inputs.barcode || ""} onChange={handleChangeBook} type="text" className="mt-1 block w-full" placeholder="123456789"/>
                    </label>
                    <label className="block">
                        <span className="text-gray-700">Title</span>
                        <input name="title" onChange={handleChange} value={inputs.title || ""} type="text" className="mt-1 block w-full" placeholder="Of Mice and Men" />
                    </label>
                    <label className="block">
                        <span className="text-gray-700">Author</span>
                        <input name="author" value={inputs.author || ""} onChange={handleChange} type="text" className="mt-1 block w-full" placeholder="John Steinbeck"/>
                    </label>
                    <label className="block">
                        <input type ="submit"></input>
                    </label>
                </div>
            </div>
        </form>
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