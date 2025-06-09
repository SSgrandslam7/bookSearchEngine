import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import type { BookInput } from '../types/BookInput.js';
import { GraphQLError } from 'graphql';
import type { IUser } from '../models/User.js';

interface GraphQLContext {
  user?: IUser & { _id: string };
}

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in to view this information.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findById(context.user._id);
      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },
  },

  Mutation: {
    login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('No user found with this email.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
 
      const isValidPassword = await user.isCorrectPassword(password);
      if (!isValidPassword) {
        throw new GraphQLError('Incorrect credentials.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (
      _parent: unknown,
      args: { username: string; email: string; password: string }
    ) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (
      _parent: unknown,
      { book }: { book: BookInput },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in to save a book.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new GraphQLError('User not found for saving book.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return updatedUser;
    },

    removeBook: async (
      _parent: unknown,
      { bookId }: { bookId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in to remove a book.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new GraphQLError('User not found for removing book.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return updatedUser;
    },
  },
};