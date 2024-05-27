// Import express
import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

// Create a server application
const app = express();
app.use(cors());
// Store the port number in a var
const port = 3001;

const prisma = new PrismaClient();

app.use(json());

// Attach a function to the route "/"
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/recipes", async (req, res) => {
  const allRecipes = await prisma.recipe.findMany({
    include: { comments: true, categories: true },
  });
  res.send(allRecipes);
});

// Tell the server to start listening, we provide the port here as the first argument.
// The second argument is a function that runs as soon as the server starts. We use it to log the port number.
app.listen(port, () => console.log(`⚡ Listening on port: ${port}`));
