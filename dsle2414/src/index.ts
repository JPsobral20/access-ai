import express, { Request, Response } from 'express';
import { Client } from 'pg';

const app = express();
const port = 3000;

// PostgreSQL client setup
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err: Error) => console.error("Error connecting to PostgreSQL:", err));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Node.js with TypeScript and PostgreSQL!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
