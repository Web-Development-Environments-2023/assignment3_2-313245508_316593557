var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");





/**
 * This path returns the home page
 */
 router.get("/", async (req, res, next) => {
    try {
      const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
      res.send(recipe);
    } catch (error) {
      next(error);
    }
  });



  /**
 * This path returns the about page
 */
 router.get("/about", async (req, res, next) => {
    try {
      const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
      res.send(recipe);
    } catch (error) {
      next(error);
    }
  });