const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const recipe_utils = require("./recipes_utils");

// Function that calls spoonacular's API to get 3 random recipes
async function getRandomRecipes(req) {

    let res = await axios.get(`${api_domain}/random`, {
        params: {
            apiKey: process.env.spooncular_apiKey,
            number: 3,
        },
    })

    // Extracts only the recipes_ids
    let recipes_id_list = [];
    for (let recipe of res.data['recipes'])
    {
        let {id} = recipe
        recipes_id_list.push(id);
    }

    // Returns the recipes preview of the random recipes_ids
    return await recipe_utils.getRecipesPreview(req, await recipe_utils.joinList(recipes_id_list)); ;
}


exports.getRandomRecipes = getRandomRecipes;