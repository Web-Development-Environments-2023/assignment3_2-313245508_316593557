var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const home_utils = require("./utils/home_utils");





/**
 * This path returns the home page (3 random recipes)
 */
 router.get("/", async (req, res, next) =>
  {
    try
    {
      const randomRecipes = await home_utils.getRandomRecipes(); // get 3 random recipes
    
      if (req.session && req.session.user_id)
      {
        const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === req.session.user_id)) 
          {
            req.user_id = req.session.user_id;
            const lastWatched = await user_utils.getLastWatched(req.session.user_id);
            const recipesPreview = await recipe_utils.getRecipesPreview(req.session.user_id, await recipe_utils.joinList(lastWatched));
            let res = [];
            res.push(randomRecipes.data);
            res.push(recipesPreview);
            const result = randomRecipes.concat(recipesPreview)
            res.send(result.data);
          }
      }
      else
      {
        res.send(randomRecipes.data);
      }
    }
    catch (error)
    {
      next(error);
    }
  });




  /**
 * This path returns the about page
 */
 router.get("/about", async (req, res, next) => {

  });





  module.exports = router;






