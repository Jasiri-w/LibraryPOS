// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { prisma } from '../../prisma/client'

export default async function handler(req, res) {
  
  if (req.method !== 'POST'){
    res.status(200).json({ name: 'John Doe' })

  }

  const checkoutData = json.parse(req.body);

  const savedCheckout = await prisma.connect.create({
    data: checkoutData,
  });

  res.json(savedCheckout);
}
