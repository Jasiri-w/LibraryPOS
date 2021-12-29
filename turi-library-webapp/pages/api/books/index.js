import { books } from '../../../data/books.js';

export default function handler(req, res) {
    res.status(200).json( books );
  }
  