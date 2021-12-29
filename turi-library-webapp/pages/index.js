import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';

import MainContent from '../components/MainContent';
import Header from '../components/Header';
import SideBar from '../components/SideBar';

import { PrismaClient } from '@prisma/client';

import superjson from 'superjson';

export default function Home(props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Turi Library Web App</title>
        <meta name="description" content="oip" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.body}>
        <div className="bg-slate-900 fixed top-0 left-0 h-screen w-20 ">
          <SideBar/>
        </div>
        <div className="w-full ml-20">
          <main className="main-content-container">
            
              <Header />
            <MainContent message="bitch" db_data={props.db_data}/>
          </main>
        </div>
      </div>

    </div>
  )
}

///For next time: In order for the frontend to display the book and the student to which the book is 
// checked out, then the books requried must be queried here in the backend getServerSideProps.
// Then the book, student and timing data need to be placed in a single object relating to one 
// checkout. This should be served as its own prop for efficiency.
// Next we need to understand the "Post" features of prisma so that we can checkout and return 
// books without refresh in the form. We have to use hooks to data bind the portrayed checkout list 
// while still updating the database as fast as possible with as few refreshes as possible.
export async function getServerSideProps() {
  const prisma = new PrismaClient();
  const checkouts = await prisma.checkout.findMany();
  const returns = await prisma.return.findMany();
  
  const ser_checkouts = checkouts.map(check => {
    var nex = check;
    neck.checkout_date = superjson.stringify(check.checkout_date);
    neck.return_date = superjson.stringify(check.return_date);
    return neck;
  })
  
  const ser_returns = checkouts.map(ret => {
    var newret = ret;
    newret.checkout_date = superjson.stringify(ret.checkout_date);
    newret.return_date = superjson.stringify(ret.return_date);
    return newret;
  })

  const database_data = {
    checkouts: ser_checkouts,
    returns: ser_returns,
    students: await prisma.student.findMany(),
    books: await prisma.book.findMany(),
  }

  
  return{
    props:{
        hello: "Jasiri",
        db_data: database_data,
    }
  }
}