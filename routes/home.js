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
    
      // Check if user is connected
      if (req.session && req.session.user_id)
      {
        const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === req.session.user_id)) 
          {
            // Gets the 3 last watched recipes id of the connected user
            req.user_id = req.session.user_id;
            const lastWatched = await user_utils.getLastWatched(req.session.user_id);
            
            // Extract the recipes preview only
            const recipesPreview = await recipe_utils.getRecipesPreview(req, await recipe_utils.joinList(lastWatched));
            let lst = [];
            lst.push(randomRecipes);
            lst.push(recipesPreview);
            res.status(200).send(lst);
          }
      }
      else
      {
        res.status(200).send(randomRecipes);
      }
    }
    catch (error)
    {
      res.status(404).send("Home page not found");
    }
  });




  /**
 * This path returns the about page
 */
 router.get("/about", async (req, res, next) => {

  });





  module.exports = router;






