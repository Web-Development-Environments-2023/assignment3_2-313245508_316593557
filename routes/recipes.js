var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const users_utils = require("./utils/user_utils");





/**
 * API that gets a query and some search preferences and returns a list of 5/10/15 recipes according to query - Takes the following parameters (in parameters):
 * query - string
 * number - int (5/10/15 only)
 * cuisine - string from list of cuisines
 * diet - string from list of diets
 * intolerances - string from list of intolerances
 */
 router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.query;
    const number = req.query.number;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerances = req.query.intolerances;

    // Saves the searched query for that user
    await users_utils.addQuerySearchedByUser(req.session, query);

    // Searches for the given query
    const recipes = await recipes_utils.searchRecipes(req, query, number, cuisine, diet, intolerances);
    res.status(200).send(recipes);
  } catch (error) {
    res.status(400).send("Wrong input parameters");
  }
});


/**
 * API that returns a full recipe with details according to the recipe_id
 * example: <websiteURL>:3000/recipes/716429
 */
router.get("/:recipeId", async (req, res, next) => {
  try {

    // Gets the recipes details by using spoonacular's API
    const recipe = await recipes_utils.getRecipeDetails(req, req.params.recipeId);
    // Check if user is connected
    if (req.session && req.session.user_id)
    {
      // const users = await DButils.execQuery("SELECT user_id FROM users")
      //   if (users.find((x) => x.user_id === req.session.user_id)) 
      //   {

      //     // Save that the connected user has watched the recipe
      //     await users_utils.markAsWatched(req.session.user_id, req.params.recipeId);
      //   }
    }

    // Sends the response with the recipe's details
    res.status(200).send(recipe);
  } catch (error) {
    res.status(404).send("recipe doesn't exist");
  }
});

module.exports = router;
