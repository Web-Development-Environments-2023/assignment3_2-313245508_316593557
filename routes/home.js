var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const home_utils = require("./utils/home_utils");





/**
 * This path returns a list of one list/two list depands if the user is connected
 */
 router.get("/", async (req, res, next) =>
  {
    try
    {
      const randomRecipes = await home_utils.getRandomRecipes(req); // get 3 random recipes
    
      if (req.session && req.session.user_id)
      {
        const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === req.session.user_id)) 
          {
            req.user_id = req.session.user_id;
            const lastWatched = await user_utils.getLastWatched(req.session.user_id);
            const recipesPreview = await recipe_utils.getRecipesPreview(req, await recipe_utils.joinList(lastWatched));
            let lst = [];
            lst.push(randomRecipes);
            lst.push(recipesPreview);
            res.send(lst);
          }
      }
      else
      {
        res.send(randomRecipes);
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






