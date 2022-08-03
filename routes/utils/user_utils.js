const DButils = require("./DButils");

// Function that inserts into the favorite_recipes table a new row. Used when a connected user saves a recipe as favorite
async function markAsFavorite(user_id, recipe_id){
    try
    {
        await DButils.execQuery(`insert into favorite_recipes (user_id, recipe_id) values(${user_id},${recipe_id})`);
        return true;
    }
    catch
    {
        return false;
    }
}

// Function that returns all the recipe_ids from the favorite_recipes.
async function getFavoriteRecipes(user_id){
    try
    {
        const recipes_id = await DButils.execQuery(`select recipe_id from favorite_recipes where user_id=${user_id}`);
        return recipes_id;
    }
    catch
    {
        return;
    }
}

// Function that returns all the recipe_ids from the private_recipes.
async function getPrivateRecipes(user_id){

    try
    {
        const recipes_id = await DButils.execQuery(`select recipe_id from private_recipes where user_id=${user_id}`);
        return recipes_id;
    }
    catch
    {
        return;
    }
}

// Function that returns all the recipe_ids from the family_recipes.
async function getFamilyRecipes(user_id){
    try
    {
        const recipes_id = await DButils.execQuery(`select recipe_id, user_id, name, recipe_inventor, when_to_make_it, ingredients, instructions, image from family_recipes where user_id=${user_id}`);
        return recipes_id;
    }
    catch
    {
        return;
    }
}

// Function that checks if a user has saved a recipe_id to his favorite - returns a boolean value
async function isFavorite(user_id, recipe_id)
{
    try
    {


        const count_of_recipes = await DButils.execQuery(`select count(*) from favorite_recipes where user_id=${user_id} and recipe_id=${recipe_id}`);
        if (count_of_recipes[0]["count(*)"] != 0){
            return true;
        }
        else{
            return false;
        }
    }
    catch
    {
        return false;
    }

}

// Function that inserts a new recipe inot the private_recipes table
async function createRecipe(amount_of_meals, ingredients, instructions, gluten_free, image, name, preparation_time, vegan, vegetarian, user_id){
    try
    {
        const response = await DButils.execQuery(`insert into private_recipes (user_id, amount_of_meals, ingredients, instructions, favorite, gluten_free, image, name, popularity, preparation_time, vegan, watched, vegetarian) values (${user_id}, '${amount_of_meals}', '${ingredients}', '${instructions}', 0, ${gluten_free}, '${image}', '${name}', 0, '${preparation_time}', ${vegan}, 0, ${vegetarian})`);
        return true;
    }
    catch
    {
        return false;
    }
}


// Function that inserts a new row into the users_watched_recipes. Used when a user watches a full recipe
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
}



async function getLastWatched(user_id)
{
    try
    {
        const recipes = await DButils.execQuery(`select recipe_id from users_watched_recipes where user_id=${user_id} order by row_index desc limit 3`);
        let lst = []
        for(let i = 0; i < recipes.length; i++)
        {
            lst.push(recipes[i]['recipe_id']);
        }
        return lst;
    }
    catch
    {
        return;
    }
}

async function getLastSearched(user_id)
{
    try
    {
        const lastSearched = await DButils.execQuery(`select query from users_searched_queries where user_id=${user_id} order by row_index desc limit 1`);
        return lastSearched[0]["query"];
    }
    catch
    {
        return;
    }
}

// Function that checks if a user watched the recipe
async function isWatched(user_id, recipe_id){
    try
    {
        const count_of_recipes = await DButils.execQuery(`select count(*) from users_watched_recipes where user_id=${user_id} and recipe_id=${recipe_id}`);

        if (count_of_recipes[0]["count(*)"] != 0){
            return true;
        }
        else{
            return false;
        }
    }
    catch
    {
        return;
    }

}

// Function that add a query search to a table in the DB
async function addQuerySearchedByUser(session, query)
{
    try 
    {
      if (session && session.user_id)
      {
         const users = await DButils.execQuery("SELECT user_id FROM users")
          if (users.find((x) => x.user_id === session.user_id)) 
          {
            let user_id = session.user_id;
            await DButils.execQuery(`insert into users_searched_queries (user_id, query) values(${user_id}, '${query}')`)
          }
      }
    }
    catch
    {
        return;
    }
   
}


// Function that checks if a user watched the recipe
async function getPrivateRecipeDetails(user_id, recipe_id)
{
    const columns = "recipe_id, name, preparation_time, image, popularity, vegan, vegetarian, amount_of_meals, ingredients, instructions, gluten_free, favorite, watched";
    const recipe_details = await DButils.execQuery(`select ` + columns + ` from private_recipes where user_id=${user_id} and recipe_id=${recipe_id}`);
    return recipe_details;
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
exports.getPrivateRecipeDetails = getPrivateRecipeDetails;
exports.getLastSearched = getLastSearched;



