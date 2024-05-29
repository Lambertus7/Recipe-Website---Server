// Import express, {json}; PrismaClient; cors
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

//LIST ALL RECIPES (GET): √
app.get("/recipes", async (req, res) => {
  const allRecipes = await prisma.recipe.findMany({
    include: { comments: true, categories: true },
  });
  res.send(allRecipes);
});

app.get("/categories", async (req, res) => {
  const allCategories = await prisma.category.findMany();
  res.send(allCategories);
});
//DYNAMIC ROUTE FOR ID (GET): √
app.get("/recipes/:id", async (req, res) => {
  const recipeId = Number(req.params.id);
  if (isNaN(recipeId)) {
    res.status(400).send();
    return;
  }
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  console.log("Something went wrong!", recipe);

  if (recipe === null) {
    res.status(404).send({ message: "Something went wrong!" });
    return;
  }
  res.send(recipe);
});

//TO CREATE (POST) A NEW RECIPE:
app.post("/recipes", async (req, res) => {
  const bodyFromRequest = req.body;

  //Data validation: √
  if (
    "name" in bodyFromRequest &&
    bodyFromRequest.name.length > 2 &&
    "instructions" in bodyFromRequest &&
    "ingredients" in bodyFromRequest &&
    "preptime" in bodyFromRequest &&
    // "serves" in bodyFromRequest &&
    "image_URL" in bodyFromRequest &&
    "categories" in bodyFromRequest
  ) {
    //Try and Catch any errors:
    try {
      const newRecipe = await prisma.recipe.create({ data: bodyFromRequest });
      res.status(201).send(newRecipe);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "Something went wrong, backender at work!" });
    }
  } else {
    res.status(400).send({
      message:
        "'name', 'instructions', 'ingredients, 'preptime', 'serves', 'image_URL' and 'categories'. Make sure to fill all these fields in order to post your delicious recipe!",
    });
  }
});

//TO CREATE (POST) A COMMENT: √
app.post("/recipes/:id/comment", async (req, res) => {
  const recipeId = Number(req.params.id);
  const bodyFromRequest = req.body;
  console.log(bodyFromRequest);

  //Step 1 - Making sure the route is a number: √
  if (isNaN(recipeId)) {
    res.status(400).send();
    return;
  }
  //Step 2 - Combine recipeId: x (?)

  //Data validation: √
  if (
    "name" in bodyFromRequest &&
    "review" in bodyFromRequest &&
    "rating" in bodyFromRequest &&
    "recipeId" in bodyFromRequest
    // "createdAt" in bodyFromRequest
  ) {
    //Try and Catch any errors: √
    try {
      const newComment = await prisma.comment.create({
        data: bodyFromRequest,
      });
      res.status(201).send(newComment);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "Something went wrong, backender at work!" });
    }
  } else {
    res.status(400).send({
      message:
        "'name' of the commenter, 'review' and 'rating' are not given. Make sure to fill all these fields in order to post your comment",
    });
  }
});

//TO EDIT/UPDATE (PATCH): √
app.patch("/recipes/:id", async (req, res) => {
  const recipeId = Number(req.params.id);
  const bodyFromRequest = req.body;
  try {
    const updateRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: bodyFromRequest,
    });
    res.send(updateRecipe);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Something went wrong, give this backender a moment to fix it!",
    });
  }
});

//TO DELETE RECIPE (DELETE): √
app.delete("/recipes/:id", async (req, res) => {
  const recipeId = Number(req.params.id);
  if (isNaN(recipeId)) {
    res.status(404).send({ message: "Bad request!" });
    return;
  }
  const deleteRecipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });
  if (deleteRecipe === null) {
    res.status(400).send();
    return;
  }
  await prisma.recipe.delete({ where: { id: recipeId } });
  res.status(200).send({ message: "Great Success! Recipe was deleted!" });
});

//LIST ALL USERS (GET): √
app.get("/users", async (req, res) => {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      password: false,
      recipes: true,
    },
  });
  res.send(allUsers);
});

//DYNAMIC ROUTE FOR USERS (GET): √
app.get("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).send();
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    //Selecting what comes into view when you search up the user: √
    select: {
      id: true,
      username: true,
      password: false,
      recipes: true,
    },
  });
  console.log("Something went wrong!", user);

  if (user === null) {
    res.status(404).send({ message: "Something went wrong!" });
    return;
  }
  res.send(user);
});

// Tell the server to start listening, we provide the port here as the first argument.
// The second argument is a function that runs as soon as the server starts. We use it to log the port number.
app.listen(port, () => console.log(`⚡ Listening on port: ${port}`));

/*
//TO COMMENT (PATCH): √
app.patch("/recipes/:id/comment", async (req, res) => {
  const recipeId = Number(req.params.id);
  const {name, instructions, ingredients, preptime, serves, image_URL, userId, comments} = req.body;

  //Data validation: x
  // if ("comment" in bodyFromRequest &&)

  //Try and catch any error(s): √
  try {
    //Update the recipe details:
    const addComment = await prisma.recipe.update({
      where: { id: recipeId },
      data: {name, instructions, ingredients, preptime, serves, image_URL, userId},
      // select: {
      //   id: true,
      //   name: true,
      //   review: true,
      //   rating: true,
      //   createdAt: true,
      //   recipeId: false,
      // },
    });

    //Get the existing comments:
    const existingComments = await prisma.comment.findMany({where: {recipeId: recipeId}})

    //Find comments to delete: x
    const existingCommentsId = existingComments.map((recipeId) => recipeId.name)
    const commentsToDelete = existingComments.filter((recipeId)) =>

    res.send(addComment);
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Something went wrong, backender at work!" });
  }
  // else { res.status(400).send({message: "Make sure to leave a comment that contains more than... "})
  // }
});
*/
