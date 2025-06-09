import type { Book } from './Book';

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: Book[];
  bookCount?: number;
}
