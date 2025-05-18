import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';

import MainContent from '../components/MainContent';
import Header from '../components/Header';
import SideBar from '../components/SideBar';

import { prisma } from '../prisma/client'
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
        <div className="w-full home-container">
          <main className="main-content-container">
            <Header />
            <MainContent db_data={props.db_data} selectedBook={props.selectedBook}/>
          </main>
        </div>
      </div>
      <Analytics />
    </div>
  )
}

export async function getServerSideProps(context) {
  const bookId = context.params?.bookId ? parseInt(context.params.bookId) : null;
  let selectedBook = null;
  if (bookId) {
    selectedBook = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        Copies: true,
      },
    });
  }
  console.log("Selected Book: ", selectedBook);
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

  await prisma.$disconnect();
  return{
    props:{
        db_data: database_data,
        selectedBook: selectedBook,
    }
  }
}