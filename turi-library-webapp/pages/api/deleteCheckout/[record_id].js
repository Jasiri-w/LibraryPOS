import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const checkoutKey = parseInt(req.query.record_id);

  try {
    // Read the checkout record
    const checkout = await prisma.checkout.findUnique({
      where: {
        id: checkoutKey,
      },
      include: {
        BookCopy: true, // Include the BookCopy relation
      },
    });

    if (!checkout) {
      res.status(404).json({ error: 'Checkout record not found' });
      return;
    }

    // Create a new return record
    const bookReturn = await prisma.return.create({
      data: {
        checkout_date: checkout.checkout_date,
        Student : {
          connect: { id: checkout.student_id }, // Connect the return to the Student
        },
        BookCopy: {
          connect: { id: checkout.copy_id }, // Connect the return to the BookCopy
        },
      },
    });

    // Delete the checkout record
    const deletedCheckout = await prisma.checkout.delete({
      where: {
        id: checkoutKey,
      },
    });

    // Update the BookCopy status to "Available"
    await prisma.bookCopy.update({
      where: { id: checkout.copy_id },
      data: { status: 'Available' },
    });

    res.json({
      deletedCheckout,
      bookReturn,
      BookCopy: {
        id: checkout.copy_id,
        bookId: checkout.BookCopy.bookId, // Ensure bookId is included
      },
    });
  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({ error: 'An error occurred while processing the return.' });
  }
};