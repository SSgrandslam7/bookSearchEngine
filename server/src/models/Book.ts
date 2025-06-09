import { Schema, type Document } from 'mongoose';

export interface BookDocument extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

// This is a subdocument schema, used inside the User model's savedBooks array
const bookSchema = new Schema<BookDocument>({
  authors: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
});

export default bookSchema;