const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const user_utils = require("./user_utils");
const DButils = require("./DButils");
const e = require("express");





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



async function getRecipeDetails(req, recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, amount_of_meals, ingredients, instructions, type_of_food } = recipe_info.data;
    preview_dict = {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        amount_of_meals: amount_of_meals,
        ingredients: ingredients,
        instructions: instructions,
        type_of_food: type_of_food,
        glutenFree: glutenFree,
    
    }
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

// Function that returns the recipe information of a recipe.
// @@@@ I dont know why, but it only returns the first recipe when I try to send multiple recipe_ids
async function getRecipesPreview(req, recipes_id_array) 
{
    try
    {
        let results = []
        let recipe_info_list =  await axios.get(`${api_domain}/informationBulk`, {
            params: {
                ids: recipes_id_array,
                apiKey: process.env.spooncular_apiKey
            }
        })

    console.log(1);
    

    // Loop through all the recipe information that has returned from Spoonacular and extract only the  preview
    for (let recipe_prev of recipe_info_list.data)
    {
        let {id, image, title, preparationMinutes, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_prev
        let preview_dict =  {
            image: image,
            title: title,
            readyInMinutes: preparationMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }

        console.log(2);



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

                console.log(3);


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

                console.log(4);

                        
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


 async function searchRecipes(req, query, number, cuisine, diet, intolerances) {

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
        const dicts = res.data['results'];

        let result_id = "";
        for(let i = 0; i < Object.keys(dicts).length; i++)
        {
            if(i !=  dicts.length - 1)
                result_id = result_id + dicts[i]['id'] + ", ";
            else
                result_id = result_id + dicts[i]['id'];
        }
        const recipes_preview = await getRecipesPreview(req, result_id);
        console.log(recipes_preview)
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
