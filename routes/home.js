var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const home_utils = require("./utils/home_utils");






/**
 * This path returns the home page (3 random recipes)
 */
 router.get("/", async (req, res, next) => {
    try {
        const randomRecipes = await home_utils.getRandomRecipes();
        res.send(randomRecipes.data);
      } catch (error) {
        next(error);
      }
  });




  /**
 * This path returns the about page
 */
 router.get("/about", async (req, res, next) => {

  });





  module.exports = router;