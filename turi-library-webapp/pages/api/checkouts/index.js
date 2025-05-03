import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(200).json({ name: 'John Doe' });
    return;
  }

  console.log("Checkout API called");
  console.log("checkout data", req.body);

  const checkoutData = JSON.parse(req.body);

  try {
    // Check if the BookCopy is available
    const bookCopy = await prisma.bookCopy.findUnique({
      where: { id: checkoutData.BookCopy.connect.id },
    });

    if (!bookCopy || bookCopy.status.toLowerCase() !== "available") {
      const status = bookCopy?.status ?? "N/A";
      const message = `The book is not available for checkout. (bookCopy: ${JSON.stringify(bookCopy)}, status: ${status})`;
    
      console.error(message); // ✅ for logs
      res.status(400).json({ error: message }); // ✅ for frontend alert display
      return;
    }
    

    // Create the new checkout entry
    const savedCheckout = await prisma.checkout.create({
      data: checkoutData,
    });

    // Update the BookCopy status to "Checked Out"
    await prisma.bookCopy.update({
      where: { id: checkoutData.BookCopy.connect.id }, // Use the BookCopy ID from the request
      data: { status: "Checked Out" }, // Update the status
    });

    res.json(savedCheckout);
  } catch (error) {
    console.error("Error creating checkout or updating BookCopy:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
};