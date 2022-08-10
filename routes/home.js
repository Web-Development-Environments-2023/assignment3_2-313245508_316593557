var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const home_utils = require("./utils/home_utils");





/**
 * API of the home page of the website - returns 3 random recipes
 * If user is connected - returns 3 random recipes + 3 last watched recipes of the connected user
 */
 router.get("/", async (req, res, next) =>
  {
    try
    {
      // Get 3 random recipes
      const randomRecipes = await home_utils.getRandomRecipes(req); 
        res.status(200).send(randomRecipes);
    }
    catch (error)
    {
      res.status(404).send("Home page not found");
    }
  });


  







  module.exports = router;






