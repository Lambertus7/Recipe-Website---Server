// Import express, {json}; PrismaClient; cors
import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { toToken } from "./auth/jwt";
import { toData } from "./auth/jwt";
import { AuthMiddleware, AuthRequest } from "./auth/middelware";

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

//LIST ALL CATEGORIES: √
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
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    //Include the objectives: √
    include: {
      categories: true,
      user: {
        //Select what will be displayed: √
        select: {
          password: false,
          username: true,
        },
      },
      comments: true,
    },
  });

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
    //Try and Catch any errors: √
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
  // console.log(bodyFromRequest);

  //Step 1 - Making sure the route is a number: √
  if (isNaN(recipeId)) {
    res.status(400).send();
    return;
  }
  //Step 2 - Combine recipeId: √

  //Data validation: √
  if (
    "name" in bodyFromRequest &&
    "review" in bodyFromRequest &&
    "rating" in bodyFromRequest
    // "recipeId" in bodyFromRequest -> We do not need this here otherwise it is not DRY for the user.
    // "createdAt" in bodyFromRequest
  ) {
    //Try and Catch any errors: √
    try {
      const newComment = await prisma.comment.create({
        data: { ...bodyFromRequest, recipeId }, //Spread the arr. and add recipeId prevent WET for user.
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

/*USER ENDPOINTS*/

//REGISTER USER (POST): x come back to finish.
// app.post("/register", async (req, res) => {
//   const bodyFromRequest = req.body;

//   if (
//     "age" in bodyFromRequest &&
//     "username" in bodyFromRequest &&
//     "password" in bodyFromRequest
//   ) {
//     try {
//       await.prisma.create({data: bodyFromRequest})
//     } res.status(201).send({message: "Account has been created!"})
//   }
// });

//LOGIN USER (POST): √
app.post("/login", async (req: AuthRequest, res) => {
  const bodyFromRequest = req.body;
  if ("username" in bodyFromRequest && "password" in bodyFromRequest) {
    try {
      // First find the user: √
      const userToLogin = await prisma.user.findUnique({
        where: {
          username: bodyFromRequest.username,
        },
      });
      if (userToLogin && userToLogin.password === bodyFromRequest.password) {
        const token = toToken({ userId: userToLogin.id });
        res.status(200).send({ token: token }); // Here we should actually send back the Keycard
        return;
      }
      // If we didn't find the user or the password doesn't match, send back an error message
      res.status(400).send({ message: "Login failed" });
    } catch (error) {
      // If we get an error, send back HTTP 500 (Server Error)
      res.status(500).send({ message: "Something went wrong!" });
    }
  } else {
    // If we are missing fields, send back a HTTP 400
    res
      .status(400)
      .send({ message: "'username' and 'password' are required!" });
  }
});

//LIST ALL USERS (GET): √
app.get("/users", AuthMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) {
    res.status(500).send("Something went wrong");
    return;
  }
  // Get the headers
  const headers = req.headers;
  // Check if the authorization key is in the headers and if the token is provided correctly
  if (
    headers["authorization"] && // Is the header there
    headers["authorization"].split(" ")[0] === "Bearer" && // Is the first word (before the space) equal to "Bearer"
    headers["authorization"].split(" ")[1] // Is there a part after the space
  ) {
    // get the token
    const token = headers["authorization"].split(" ")[1];
    try {
      // Verify the token, this will throw an error if it isn't
      const data = toData(token);
      // If we reach this point the token was correct!
    } catch (e) {
      res.status(401).send({ message: "Token missing or invalid" });
      return;
    }
  } else {
    res.status(401).send({ message: "Token missing or invalid" });
    return;
  }
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

//MIDDLEWARE:
app.get("/path", AuthMiddleware, (req: AuthRequest, res) => {
  // your route logic
  // Inside here you can access req.userId to get the user's id
  // Don't forget to add the following check
  if (!req.userId) {
    res.status(500).send("Something went wrong");
    return;
  }
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
