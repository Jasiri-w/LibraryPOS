import {PrismaClient} from '@prisma/client';
import { useRouter } from 'next/router';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  
  if (req.method !== 'POST'){
  }

  const checkoutKey = parseInt(req.query.record_id);
  // Read checkout
  const checkout = await prisma.checkout.findUnique({
    where: {
      id: checkoutKey,
    },
  })

  //Copy data as new record of Return 
  const bookReturn = await prisma.return.create({
    data: {
      book_id: checkout.book_id,
      student_id: checkout.student_id,
      checkout_date: checkout.checkout_date,
    },
  })

  const deleteUser = await prisma.checkout.delete({
    where: {
      id: checkoutKey,
    },
  })

  res.json(deleteUser);
};