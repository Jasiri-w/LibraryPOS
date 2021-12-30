import { useState } from 'react';

function DueBooks(props){
    return (
        <div className="split card-container">
            <h1 className="text-center text-8xl text-black">Books Signed Out</h1>
            <div className="book-list mx-auto">
                <p>{ props.hello }</p>
                <UnavailableBooks db_data={props.db_data}/>
            </div>
        </div>
    );
};

const UnavailableBooks = (props) => {
    const [checkouts, setCheckout] = useState(props.db_data.checkouts);
    console.log("Unavailable Books")
    console.table(checkouts)
    return(
        <ol>
            {
                checkouts.map(check =>{
                    return(
                        <li key={check.id}>{check.id}.) {check.Student.first_name} {check.Student.last_name} - {check.Book.title} by {check.Book.author} </li>
                    );
                })
            }
        </ol>
    );
    
    /*return checkedOutBooks.length > 0 ?  (
        <ol>
            {
                checkedOutBooks.map(book => {
                    return (
                        <li id={book.id}>
                            { book.checkout_date }
                        </li>
                    )
                })
            }
        </ol>
    ) : (
        <div className="notes-empty">
          <p>No notes created yet</p>
        </div>
    );*/
}

export default DueBooks;