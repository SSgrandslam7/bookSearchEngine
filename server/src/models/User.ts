import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Subdocument type for savedBooks
export interface SavedBook {
  bookId: string;
  authors?: string[];
  description?: string;
  title?: string;
  image?: string;
  link?: string;
}

// Main user interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  savedBooks: SavedBook[];
  isCorrectPassword: (password: string) => Promise<boolean>;
}

// SavedBook sub-schema
const bookSchema = new Schema<SavedBook>(
  {
    bookId: {
      type: String,
      required: true,
    },
    authors: [String],
    description: String,
    title: String,
    image: String,
    link: String,
  },
  { _id: false }
);

// User schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: [bookSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash user password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Compare incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Create and export the model
const User = model<IUser>('User', userSchema);

export default User;