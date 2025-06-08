import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './src/schemas/typeDefs';
import { resolvers } from './src/schemas/resolvers';
import db from './src/config/connection';
import { authenticateTokenGraphQL } from './src/services/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

// Apollo middleware with context
app.use(
  '/graphql',
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const user = await authenticateTokenGraphQL(req);
      return { user };
    },
  })
);

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Connect DB and start server
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Server running at http://localhost:${PORT}`);
    console.log(`🔮 GraphQL at http://localhost:${PORT}/graphql`);
  });
});