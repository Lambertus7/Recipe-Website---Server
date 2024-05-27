import { PrismaClient } from "@prisma/client";
import users from "./data/users.json";
import recipes from "./data/recipes.json";
import comments from "./data/comments.json";
import categories from "./data/categories.json";

const prisma = new PrismaClient();

// const seed = async () => {
//   console.log("Seeding Users...");

//   for (let i = 0; i < users.length; i++) {
//     const userData = users[i];
//     if (userData) await prisma.user.create({ data: userData });
//   }

//   console.log("Seeding Recipes");

//   for (let j = 0; j < recipes.length; j++) {
//     const recipeData = recipes[j];
//     if (recipeData) await prisma.recipe.create({ data: recipeData });
//   }

//   console.log("Seeding Comments...");

//   for (let i = 0; i < comments.length; i++) {
//     const commentData = comments[i];
//     if (commentData) await prisma.comment.create({ data: commentData });
//   }

//   console.log("Seeding Categories...");

//   for (let i = 0; i < categories.length; i++) {
//     const categoryData = categories[i];
//     if (categoryData) await prisma.category.create({ data: categoryData });
//   }
// };

// seed();

const seed = async () => {
  console.log("Seeding Users...");

  for (let i = 0; i < users.length; i++) {
    const userData = users[i];
    if (userData) await prisma.user.create({ data: userData });
  }

  console.log("Seeding Categories...");

  for (let i = 0; i < categories.length; i++) {
    const categoryData = categories[i];

    if (categoryData) await prisma.category.create({ data: categoryData });
  }

  console.log("Seeding Recipes...");

  for (let j = 0; j < recipes.length; j++) {
    const recipeData = recipes[j];

    if (recipeData) {
      await prisma.recipe.create({
        data: recipeData,
      });
    }
  }

  console.log("Seeding Comments...");

  for (let i = 0; i < comments.length; i++) {
    const commentData = comments[i];
    if (commentData) await prisma.comment.create({ data: commentData });
  }
};

seed();
