import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  
  if (req.method !== 'POST'){
    res.status(200).json({ name: 'John Doe' })

  }

  const checkoutData = JSON.parse(req.body);

  const savedCheckout = await prisma.checkout.create({
    data: checkoutData,
  });

  res.json(savedCheckout);
};