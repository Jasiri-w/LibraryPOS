import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';

import MainContent from '../components/MainContent';
import Header from '../components/Header';
import SideBar from '../components/SideBar';

import { PrismaClient } from '@prisma/client';
import { Analytics } from "@vercel/analytics/react"

import superjson from 'superjson';

export default function Home(props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Library Dashboard : Read!</title>
        <meta name="description" content="oip" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="body">
        {/**<div className="bg-slate-900 fixed top-0 left-0 h-screen w-20 ">
          <SideBar/>
  </div>**/}
        <div className="w-full home-container">
          <main className="main-content-container">
            
              <Header />
            <MainContent message="man" db_data={props.db_data}/>
          </main>
        </div>
      </div>

    </div>
  )
}

///For next time: In order for the frontend to display the book and the student to which the book is 
// checked out, then the books requried must be queried here in the backend getServerSideProps.
// Then the book, student and timing data need to be placed in a single object relating to one 
// checkout. DONE This should be served as its own prop for efficiency.  DONE

// Next we need to understand the "Post" features of prisma so that we can checkout and return 
// books without refresh in the form. We have to use hooks to data bind the portrayed checkout list 
// while still updating the database as fast as possible with as few refreshes as possible.
export async function getServerSideProps() {
  const prisma = new PrismaClient();
  const checkouts = await prisma.checkout.findMany({
    include: {
      Student: true,
      BookCopy: {
        include: {
          Book: true,
        },
      },
    },
  });
  const returns = await prisma.return.findMany();
  
  const ser_checkouts = checkouts.map(check => {
    var neck = check;
    neck.checkout_date = JSON.parse(superjson.stringify(check.checkout_date)).json;
    /*neck.return_date = JSON.parse(check.return_date).json;*/
    return neck;
  })
  
  const ser_returns = returns.map(ret => {
    var newret = ret;
    newret.checkout_date = JSON.parse(superjson.stringify(ret.checkout_date)).json;
    newret.return_date = JSON.parse(superjson.stringify(ret.return_date)).json;
    return newret;
  })

  const database_data = {
    checkouts: ser_checkouts,
    returns: ser_returns,
    students: await prisma.student.findMany(),
    books: await prisma.book.findMany({
      include: {
        Copies: true,
      },
    }),
  }

  /*for(var x = 0; x < ser_checkouts.length; x++){
    console.log(JSON.parse(checkouts[x].checkout_date).json);
  }*/

  /*console.log("Database_data at GSSP function in main page:");
  console.table(database_data);
  console.log("Serialized Checkouts: ");
  console.table(ser_checkouts);
  console.log("Checkouts Rawdogged");
  console.table(checkouts);*/
  return{
    props:{
        hello: "Jasiri",
        db_data: database_data,
    }
  }
}