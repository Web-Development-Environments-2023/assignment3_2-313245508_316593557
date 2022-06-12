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
      res.send(randomRecipes.data);
    }
    catch
    {
      console.log("gg");
    }

    try 
    {
      if (req.session && req.session.user_id)
      {

        const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === req.session.user_id)) 
          {
            req.user_id = req.session.user_id;
            const lastWatched = await user_utils.getLastWatched(req.session.user_id);
            const recipesPreview = await recipe_utils.getRecipesPreview(lastWatched);
            res.send(recipesPreview.data);
          }
      }
    }
    catch (error)
    {
      //
    }
  });




  /**
 * This path returns the about page
 */
 router.get("/about", async (req, res, next) => {

  });





  module.exports = router;








//   /**
//  * This path returns the home page (3 random recipes)
//  */
//  router.get("/", async (req, res, next) => {
//   try {
//       const randomRecipes = await home_utils.getRandomRecipes();
//       res.send(randomRecipes.data);
//     } catch (error) {
//       next(error);
//     }
// });
