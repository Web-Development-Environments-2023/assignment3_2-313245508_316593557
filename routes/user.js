var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if(Object.keys(req.session).length === 0)
  {
    res.sendStatus(401);
  }

  if (req.session && req.session.user_id) {

    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {

        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } 
  else 
  {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user. Takes the following parameters (in body):
 * recipe_id - int
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;

    // Saves that the given user_id has marked the given recipe_id as a favorite recipe
    const result = await user_utils.markAsFavorite(user_id,recipe_id);
    if(result)
      res.status(200).send("The recipe successfully saved as favorite");
    else
      res.status(201).send("The recipe is already marked as favorite");

    } catch(error)
    {
      res.status(401).send("user is not authorized");
    }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    // Check if user is connected
    const user_id = req.session.user_id;
    if (req.session && user_id)
    {
      const users = await DButils.execQuery("SELECT user_id FROM users")
        if (users.find((x) => x.user_id === req.session.user_id)) 
        {

          // Gets the recipes_ids that were saved as "favorite" by the connected user
          const recipes_id = await user_utils.getFavoriteRecipes(user_id);
          let recipes_id_array = [];

          // Extracts the recipe_ids into an array
          recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); 

          // Casts the recipe_ids to a string with ',' in between and gets the preview of these recipes_ids
          let recipes_id_str = await recipe_utils.joinList(recipes_id_array);
          const results = await recipe_utils.getRecipesPreview(req, recipes_id_str);
          res.status(200).send(results);
        }
    }
    else
    {
      res.status(201).send("User is not connected")
    }
    
    
  } catch(error){
    res.status(404).send("error occured")
  }
});




/**
 * API that adds a new private recipes for the connected user. Takes the following parameters (body):
 * amount_of_meals - string
 * ingredients - string
 * type_of_food - string
 * gluten_free - binary int (0/1)
 * image - string (url of image)
 * name - string
 * popularity - int
 * preparation_time - string
 * vegan - binary int (0/1)
 * vegetarian - binary int (0/1)
 */
 router.post('/private', async (req,res,next) => {
  try 
  {
    // Extracts all the parameters from the body
    const amount_of_meals = req.body.amount_of_meals;
    const ingredients = req.body.ingredients;
    const instructions = req.body.instructions;
    const gluten_free = req.body.gluten_free;
    const image = req.body.image;
    const name = req.body.name;
    const preparation_time = req.body.preparation_time;
    const vegan = req.body.vegan;
    const vegetarian = req.body.vegetarian;
    const user_id = req.session.user_id;
   // const user_id = 6;



    // Creates the recipe and saves it
    const result = await user_utils.createRecipe(amount_of_meals, ingredients, instructions, gluten_free, image, name, preparation_time, vegan, vegetarian, user_id);
    if(result)
      res.status(200).send("The recipe has been successfully created");
    else
      res.status(201).send("The recipe already exist");

} catch (error) {
  res.status(400).send("wrong input parameter");

}
  
});

/**
 * This path returns the private recipes that were created by the logged-in user
 */
router.get('/private', async (req,res,next) => {
  try{
    console.log(req.session)
    // Extracts the connected user_id
    const user_id = req.session.user_id;

    // Gets the preview of all the recipes that were saved for that user
    const results = await recipe_utils.getPrivateRecipesPreview(user_id);
    res.status(200).send(results);
  } catch(error){
    res.status(401).send("user is not authorized");
  }

});


/**
 * This path returns the family recipes that were saved by the logged-in user
 */
router.get('/family', async (req,res,next) => {
  try{
    // Extracts the connected user_id
    const user_id = req.session.user_id;

    // Gets the recipes that were saved in the family recipes of the user
    const results = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send(results);
  } catch(error){
    res.status(401).send("user not connected");
  }
});


/**
 * This path returns a full details of a private recipe by its id
 */
 router.get("/privateRecipes/:recipeId", async (req, res, next) => {
  try {
    const recipe = await user_utils.getPrivateRecipeDetails(req.session.user_id , req.params.recipeId);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});


// TODO add comments
router.get("/lastwatched", async (req, res, next) =>{
  try{
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
          res.status(200).send(recipesPreview);
        }
    }
  } catch (error)
  {
    next(error);
  }
});


router.get("/lastSearched", async (req, res, next) =>{
  try{
    // Check if user is connected
    if (req.session && req.session.user_id)
    {
      const users = await DButils.execQuery("SELECT user_id FROM users")
        if (users.find((x) => x.user_id === req.session.user_id)) 
        {
          // Gets the 3 last watched recipes id of the connected user
          req.user_id = req.session.user_id;
          const lastSearched = await user_utils.getLastSearched(req.session.user_id);
          let resList = []
          resList.push(lastSearched)
          // Extract the recipes preview only
          res.status(200).send(resList);
        }
    }
  } catch (error)
  {
    next(error);
  }
});
  




module.exports = router;




// 1. change the Yaml
