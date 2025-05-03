import { prisma } from '../../prisma/client'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, author, olid } = req.body;

    if (!title || !author || !olid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newRequest = await prisma.bookRequest.create({
        data: {
          title,
          author,
          olid,
        },
      });

      return res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating book request:', error);
      return res.status(500).json({ error: 'Failed to create book request' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}