const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favorite_recipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favorite_recipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getPrivateRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from private_recipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getFamilyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id, name, recipe_inventor, when_to_make_it, ingredients, instructions, image from family_recipes where user_id='${user_id}'`);
    return recipes_id;
}

// Function that checks if a user has saved a recipe_id to his favorite - returns a boolean value
async function isFavorite(user_id, recipe_id){
    const count_of_recipes = await DButils.execQuery(`select count(*) from favorite_recipes where user_id=${user_id} and recipe_id=${recipe_id}`);
    if (count_of_recipes > 0){
        return true;
    }
    else{
        return false;
    }
    // return recipes_id;
}


async function createRecipe(amount_of_meals, ingredients, instructions, type_of_food, gluten_free, image, name, popularity, preparation_time, vegan, vegetarian, user_id){
    const response = await DButils.execQuery(`insert into private_recipes (user_id, amount_of_meals, ingredients, instructions, type_of_food, favorite, gluten_free, image, name, popularity, preparation_time, vegan, watched, vegetarian) values (${user_id}, '${amount_of_meals}', '${ingredients}', '${instructions}', '${type_of_food}', 0, ${gluten_free}, '${image}', '${name}', ${popularity}, '${preparation_time}', ${vegan}, 0, ${vegetarian})`);
    return response;
}



async function markAsWatched(user_id, recipe_id) 
{
    try
    {
        await DButils.execQuery(`insert into users_watched_recipes (user_id, recipe_id) values (${user_id}, ${recipe_id})`);
    }
    catch
    {
        return;
    }
    return;
}



async function getLastWatched(user_id)
{
    const recipes = await DButils.execQuery(`select recipe_id from users_watched_recipes where user_id=${user_id} order by row_index desc limit 3`);
    let lst = []
    for(let i = 0; i <3; i++)
    {
        lst.push(recipes[i]['recipe_id']);
    }
    return lst;
}

// Function that checks if a user watched the recipe
async function isWatched(user_id, recipe_id){
    const count_of_recipes = await DButils.execQuery(`select count(*) from users_watched_recipes where user_id=${user_id} and recipe_id=${recipe_id}`);
    if (count_of_recipes > 0){
        return true;
    }
    else{
        return false;
    }
}

// Function that add a query search to a table in the DB
async function addQuerySearchedByUser(query)
{
    try 
    {
      if (req.session && req.session.user_id)
      {

        const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === req.session.user_id)) 
          {
            req.user_id = req.session.user_id;
            await DButils.execQuery(`insert into users_searched_queries (user_id, query) values(${req.user_id}, '${query}'))`)
          }
      }
    }
    catch (error)
    {
      next(error);
    }
   
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getPrivateRecipes = getPrivateRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
exports.isFavorite = isFavorite;
exports.createRecipe = createRecipe;
exports.markAsWatched = markAsWatched;
exports.getLastWatched = getLastWatched;
exports.isWatched = isWatched;
exports.addQuerySearchedByUser = addQuerySearchedByUser;


