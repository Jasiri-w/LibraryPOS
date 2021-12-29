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
    var information = []
    /*for(var x = 0; x < checkouts.length; x++){
        information.push(checkout)
    }*
    return(
        <ol>
            {
                checkouts.map(check =>{
                    return(
                        <li key={check.id}>{check.id}</li>
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