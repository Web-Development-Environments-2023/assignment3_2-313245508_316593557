var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");


router.get("/", (req, res) => res.send("im here"));



/**
 * This path gets a query and returns some recipies
 */
 router.get("/search", async (req, res, next) => {
  try {

    const query = req.query.query;
    const number = req.query.number;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerances = req.query.intolerances;

    const recipes = await recipes_utils.searchRecipes(query, number, cuisine, diet, intolerances);
    res.send(recipes.data);
  } catch (error) {
    next(error);
  }

});





/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});




/**
 * This path gets gets details about a new recipie and add it to the website
 */
 router.post('/recipe/createRecipe', async (req,res,next) => {

})





module.exports = router;
