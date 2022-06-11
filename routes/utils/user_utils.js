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
// @@@@ I did not check that this function works yet@@@@@
async function isFavorite(user_id, recipe_id){
    const count_of_recipes = await DButils.execQuery(`select count(*) from favorite_recipes where user_id='${user_id}' and recipe_id='${recipe_id}`);
    if (count_of_recipes > 0){
        return True
    }
    else{
        return False
    }
    // return recipes_id;
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getPrivateRecipes = getPrivateRecipes;
exports.getFamilyRecipes = getFamilyRecipes;