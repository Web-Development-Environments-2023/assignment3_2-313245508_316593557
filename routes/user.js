var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {

    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {

        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});



/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
 router.post('/private', async (req,res,next) => {
  try 
  {
    const amount_of_meals = req.body.amount_of_meals;
    const ingredients = req.body.ingredients;
    const instructions = req.body.instructions;
    const type_of_food = req.body.type_of_food;
    const gluten_free = req.body.gluten_free;
    const image = req.body.image;
    const name = req.body.name;
    const popularity = req.body.popularity;
    const preparation_time = req.body.preparation_time;
    const vegan = req.body.vegan;
    const vegetarian = req.body.vegetarian;
    const user_id = req.session.user_id;

    const recipes = await user_utils.createRecipe(amount_of_meals, ingredients, instructions, type_of_food, gluten_free, image, name, popularity, preparation_time, vegan, vegetarian, user_id);
    res.send(recipes.data);
} catch (error) {
  next(error);
}
  
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/private', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getPrivateRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }

});

// Function I did only to test the GetRecipe Preview
router.get('/testGetRecipePreview', async (req,res,next) => {
  try{
    const recipeID = req.query.recipeID
    const results = await recipe_utils.getRecipesPreview(req.session.user_id ,recipeID)
    res.status(200).send(results)
  }catch(error){
    next(error)
  }
})




/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/family', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});



module.exports = router;










// 1. check all paths
// 2. check the types in the DataBase, and increase VarChars len
// 3. *getPreviewPrivate
// 4. 
// 5. change the Yaml 