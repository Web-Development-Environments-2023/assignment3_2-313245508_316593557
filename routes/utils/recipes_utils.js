const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const user_utils = require("./user_utils");
const DButils = require("./DButils");
const e = require("express");





/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */

// Function that gets a recipe_id and returns all the recipe's info from the spoonacular API
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}


// // Function that gets a recipe_id, calls the spoonacular API to get all the recipe's info, then returns only relevant information
// async function getAnalizedInstructions(recipe_id) 
// {
//     try
//     {
//         // Calls the spoonacular's API to get all the information about the recipes
//         let analyzedInstructions =  await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
//             params: {
//                 apiKey: process.env.spooncular_apiKey
//             }
//         })
//         return analyzedInstructions
//     }
//     catch
//     {
//         console.log("err");
//     }
// }



// Function that gets a recipe_id, calls the spoonacular API to get all the recipe's info, then returns only relevant information
async function getRecipeDetails(req, recipe_id) {
    // Gets all the recipe's info
    let recipe_info = await getRecipeInformation(recipe_id);
    //let analyzedInstructions = await getAnalizedInstructions(recipe_id);

    // Extract only the relevant information
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian,analyzedInstructions, glutenFree, servings, extendedIngredients, instructions, type_of_food } = recipe_info.data;
    preview_dict = {
        id: id,
        analyzedInstructions: analyzedInstructions,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        servings: servings,
        extendedIngredients: extendedIngredients,
        instructions: instructions,
        type_of_food: type_of_food,
        glutenFree: glutenFree,
    }


    // If there is a connected user - checks if he has watched/saved to favorite the recipe
    if (req.session && req.session.user_id)
    {
        const users = await DButils.execQuery("SELECT user_id FROM users")
        if (users.find((x) => x.user_id === req.session.user_id)) 
        {
            // Checks if the user has saved the recipe to his favorite
            const is_saved_to_favorites = await user_utils.isFavorite(req.session.user_id, id);
            if (is_saved_to_favorites)
            {
                preview_dict['favorite'] = true;
            }
            else
            {
                preview_dict['favorite'] = false;
            }

            // Checks if the recipe has been watched by the user
            const is_watched = await user_utils.isWatched(req.session.user_id, id);
            if (is_watched)
            {
                preview_dict['watched'] = true;
            }
            else
            {
                preview_dict['watched'] = false;
            }
                    
        }
    }
    else
    {
        preview_dict['watched'] = false;
        preview_dict['favorite'] = false;
    }
    return preview_dict;
}

// Function that gets a list of recipe_ids and returns the preview of theses recipes
async function getRecipesPreview(req, recipes_id_array) 
{
    try
    {
        // Calls the spoonacular's API to get all the information about the recipes
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
        let {id, image, title, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_prev
        let preview_dict =  {
            id: id,
            image: image,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }

        // Checks if the user is connected - checks if he has watched/saved to favorite the recipe
        if (req.session && req.session.user_id)
        {
  
          const users = await DButils.execQuery("SELECT user_id FROM users")
            if (users.find((x) => x.user_id === req.session.user_id)) 
            {
                // Checks if the user has saved the recipe to his favorite
                const is_saved_to_favorites = await user_utils.isFavorite(req.session.user_id, id);
                if (is_saved_to_favorites)
                {
                    preview_dict['favorite'] = true;
                }
                else
                {
                    preview_dict['favorite'] = false;
                }

                // Checks if the recipe has been watched by the user
                const is_watched = await user_utils.isWatched(req.session.user_id, id);
                if (is_watched)
                {
                    preview_dict['watched'] = true;
                }
                else
                {
                    preview_dict['watched'] = false;
                }       
            }
        }
        else
        {
            preview_dict['watched'] = false;
            preview_dict['favorite'] = false;
        }

        // Adds the preview dictionnary to the result array
        results.push(preview_dict)
    }
    return results
}
catch
{
    console.log("err");
}

}


// Helper function that receives an array of ids and returns a string of "id1,id2,id3,..."
async function joinList(recipes_id_array)
{
  let recipes_id_str = "";
  for (var i = 0; i < recipes_id_array.length; i++)
  {
    if(i != recipes_id_array.length - 1)
    {
      recipes_id_str += recipes_id_array[i] + ",";
    }
    else
    {
      recipes_id_str += recipes_id_array[i];
    }
  }
  return recipes_id_str
}




// Function that returns the preview of all the private recipes of a user
async function getPrivateRecipesPreview(user_id) 
{
    // Extracts all the private recipes from the DB
    let results = []
    let recipe_info_list =  await DButils.execQuery(`select * from private_recipes where user_id=${user_id}`);
    if(recipe_info_list == [])
    {
        return results;
    }
    
    // Loop through all the recipe information that has returned from the DB and arrange the info in a list of dictionnaries
    for (let recipe_prev of recipe_info_list)
    {        
        let preview_dict =  {
            favorite: recipe_prev['favorite'],
            gluten_free: recipe_prev['gluten_free'],
            image: recipe_prev['image'],
            name: recipe_prev['name'],
            popularity: recipe_prev['popularity'],
            preparation_time: recipe_prev['preparation_time'],
            vegan: recipe_prev['vegan'],
            watched: recipe_prev['watched'],
            vegetarian: recipe_prev['vegetarian'],
        }
        results.push(preview_dict);
    }
    return results;
}


// Function that calls the spoonacular's API to search for recipes according to a given query and preferences parameters
 async function searchRecipes(req, query, number, cuisine, diet, intolerances) {
        // Calls the spoonacular's APi
        let res = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                apiKey: process.env.spooncular_apiKey,
                query: query, 
                number: number,
                cuisine: cuisine, 
                diet: diet,
                intolerances: intolerances,
                instructionsRequired: true,
                addRecipeInformation: true,
            },
        })

        // Extracts the recipe_ids of the returned recipes
        const dicts = res.data['results'];
        let result_id = "";
        for(let i = 0; i < Object.keys(dicts).length; i++)
        {
            if(i !=  dicts.length - 1)
                result_id = result_id + dicts[i]['id'] + ", ";
            else
                result_id = result_id + dicts[i]['id'];
        }

        // Gets the preview of the returned recipes
        const recipes_preview = await getRecipesPreview(req, result_id);

        // Adds into the recipes preview the instructions that came back from spoonacular's API
        for(let i = 0; i < dicts.length; i++)
        {
            recipes_preview[i]['instructions'] = dicts[i]['analyzedInstructions']
        }
        return recipes_preview;
}



exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipes = searchRecipes;
exports.getRecipesPreview = getRecipesPreview;
exports.getPrivateRecipesPreview = getPrivateRecipesPreview;
exports.joinList = joinList;
// exports.getAnalizedInstructions = getAnalizedInstructions;
