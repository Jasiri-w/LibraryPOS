import { prisma } from '../../../prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Example: expects each row to have title, author, isbn, format
    const createdBooks = [];
    for (const row of data) {
      if (!row.title || !row.author || !row.isbn) continue; // skip incomplete rows

      const book = await prisma.book.create({
        data: {
          title: row.title,
          author: row.author,
          isbn: row.isbn,
          format: row.format || '',
        },
      });
      createdBooks.push(book);
    }

    return res.status(200).json({ message: 'Books imported', count: createdBooks.length });
  } catch (error) {
    console.error('CSV import error:', error);
    return res.status(500).json({ error: 'Server error during import' });
  }
}