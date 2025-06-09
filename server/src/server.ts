import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import type { Request, Response } from 'express';

import connectDB from './config/connection';
import { typeDefs } from './schemas/typeDefs';
import { resolvers } from './schemas/resolvers';
import { authenticateToken } from './services/auth';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const app = express();

  await connectDB();

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: authenticateToken,
  })
);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('client/dist')));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve('client/dist/index.html'));
  });
}

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
  });
};

startServer();