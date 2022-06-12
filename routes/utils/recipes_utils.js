const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const user_utils = require("./user_utils");
const DButils = require("./DButils");





/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

// Function that returns the recipe information of a recipe.
// @@@@ I dont know why, but it only returns the first recipe when I try to send multiple recipe_ids
async function getRecipesPreview(user_id, recipes_id_array) 
{
    let results = []
    let recipe_info_list =  await axios.get(`${api_domain}/informationBulk`, {
        params: {
            ids: recipes_id_array,
            apiKey: process.env.spooncular_apiKey
        }
    })

    // Loop through all the recipe information that has returned from Spoonacular and extract only the  preview
    for (let recipe_prev of recipe_info_list.data)
    {
        let {id, image, title, preparationMinutes, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_prev
        let preview_dict =  {
            recipe_id: id,
            image: image,
            title: title,
            readyInMinutes: preparationMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }
    
        // Checks if the user has saved the recipe to his favorite
        const is_saved_to_favorites = await user_utils.isFavorite(user_id, id);
        if (is_saved_to_favorites)
        {
            preview_dict['favorite'] = true;
        }
        else
        {
            preview_dict['favorite'] = false;
        }

        // Checks if the recipe has been watched by the user
        const is_watched = await user_utils.isWatched(user_id, id);
        if (is_watched)
        {
            preview_dict['watched'] = true;
        }
        else
        {
            preview_dict['watched'] = false;
        }

        // Adds the preview dictionnary to the result array
        results.push(preview_dict)
    }
    return results
}



// Function that returns the recipe information of a recipe.
async function getPrivateRecipesPreview(user_id) 
{
    let results = []
    let recipe_info_list =  await DButils.execQuery(`select * from private_recipes where user_id=${user_id}`);
    if(recipe_info_list == [])
    {
        return results;
    }
    
    
    // Loop through all the recipe information that has returned from Spoonacular and extract only the  preview
    for (let recipe_prev of recipe_info_list)
    {
        console.log(recipe_prev)
        
        let preview_dict =  {
            recipe_id: recipe_prev['recipe_id'],
            favorite: recipe_prev['favorite'],//
            gluten_free: recipe_prev['gluten_free'],//
            image: recipe_prev['image'],
            name: recipe_prev['name'],
            popularity: recipe_prev['popularity'],
            preparation_time: recipe_prev['preparation_time'],
            vegan: recipe_prev['vegan'],//
            watched: recipe_prev['watched'],//
            vegetarian: recipe_prev['vegetarian'],//
        }
        console.log(preview_dict['favorite'].values())

        // if(preview_dict['favorite']['data'][0] == 48)
        //     favorite['favorite'] = '0';
        // else
        //     favorite['favorite'] = '1';
        

        // Adds the preview dictionnary to the result array
        results.push(preview_dict);
    }
    return results;
}


 async function searchRecipes(query, number, cuisine, diet, intolerances) {

        let res = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                // includeNutrition: false,
                apiKey: process.env.spooncular_apiKey,
                query: query, 
                number: number,
                cuisine: cuisine, 
                diet: diet,
                intolerances: intolerances
            },
        })
        return res;
}



exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipes = searchRecipes;
exports.getRecipesPreview = getRecipesPreview;
exports.getPrivateRecipesPreview = getPrivateRecipesPreview;

