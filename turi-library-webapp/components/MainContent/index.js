
import { useState } from 'react';

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
          body: JSON.stringify(checkout)
        });
        if(!response.ok){
          throw new Error(response.statusText);
        }
      
        return await response.json();
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        /** Unnecessary but alot of good work i might need later
         * const formData = new FormData(event.target);
         * var student_id = formData.get('student_id');
         * var book_id = formData.get('barcode'); **/
        const formData = new FormData(event.target);
        var student_id = formData.get('student_id');

        const new_checkout = {
            student_id: student_information.holdings.id,
            book_id: book_information.holdings.id,
        }
        try{
            const saved = await saveCheckout(new_checkout);
            const new_checkout_frontend = {
                ///id:  String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now(),
                id:  parseInt(saved.id),
                Student: {
                    first_name: student_information.holdings.first_name, 
                    last_name: student_information.holdings.last_name, 
                },
                Book: {
                    title: book_information.holdings.title,
                    author: book_information.holdings.author,
                }
            }
            event.target.reset();
            setCheckout(checkouts.concat(new_checkout_frontend));
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
        var checkout_id = event.target.id;
        try{
            const deleted = await deleteCheckout(checkout_id);
            //change frontend list of checkouts
            setCheckout(checkouts.filter(record => record.id !== deleted.id));
        } catch (err) {
            console.log(err);
        }
    }

    const dateify = (date) => {
        if(date == undefined){
            return " just now ...";
        }else{
            return date.substring(0,10);
        }
    }

    const clearInputs = () => {
        setInputs(values => ({...values, ["student_id"]: ""}));
        setInputs(values => ({...values, ["barcode"]: ""}));
        setInputs(values => ({...values, ["title"]: ""}));
        setInputs(values => ({...values, ["author"]: ""}));
    }

    return (
        <div className="dashboard-container justify-center">
            <form className="split "id="exchange_form" onSubmit={handleSubmit}>
                <div className="card-container ">
                    <h1 className="">Check Out | Return Book</h1>
                    <div className="grid grid-cols-2 gap-6" id="book-form-grid">
                        <label className="block">
                            <span className="text-gray-700 dark:text-slate-400">Student ID</span>
                            <input required name="student_id" type="text" className="field" placeholder="123456789" value={inputs.student_id || ""} onChange={handleChangeStudent}/>
                        </label>
                        <label className="block align-middle text-center pt-4">
                            <span className="text-gray-700 text-2xl font-bold inline-block dark:text-white">{student_information.holdings.first_name || ""}  {student_information.holdings.boarding_house || ""}</span>
                        </label>
                        <label className="block">
                            <span className="text-gray-700 dark:text-slate-400">Book Barcode</span>
                            <input required name="barcode" value={inputs.barcode || ""} onChange={handleChangeBook} type="text" className="field" placeholder="123456789"/>
                        </label>
                        <label className="block">
                            <span className="text-gray-700 dark:text-slate-400">Title</span>
                            <input name="title" onChange={handleChange} value={inputs.title || ""} type="text" className="field" placeholder="Of Mice and Men" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 dark:text-slate-400">Author</span>
                            <input name="author" value={inputs.author || ""} onChange={handleChange} type="text" className="field" placeholder="John Steinbeck"/>
                        </label>
                        <span className="block align-middle text-right pt-4">
                            <input type ="submit" value="Checkout" className="mx-2"></input>
                            <input type ="reset" value="Clear" className="mx-2" onClick={clearInputs}></input>
                        </span>
                    </div>
                </div>
            </form>
            <div className="split flex-col">
                <div className="card-container">
                    <h1 className="text-center text-8xl text-black">Books Checked Out ({checkouts.length})</h1>
                    <div className="book-list mx-auto">
                        <ol>
                            {
                                checkouts.map(check =>{
                                    return(
                                        <li class="checkout-elem" onClick={handleDelete} id={check.id} key={check.id}> {check.Student.first_name} {check.Student.last_name} - {check.Book.title} by {check.Book.author} - Since {dateify(check.checkout_date)} </li>
                                    );
                                })
                            }
                        </ol>
                    </div>
                </div>
                <div className="link-container">
                    <p className="link">All Books</p>
                    <p className="link">Checkout Log</p>
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