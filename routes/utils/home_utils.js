const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";





async function getRandomRecipes() {
    let res = await axios.get(`${api_domain}/random`, {
        params: {
            apiKey: process.env.spooncular_apiKey,
            number: 3,
        },
    })

    let recipes_id_list = [];
    for (let recipe of res.data)
    {
        let {id} = recipe
        recipes_id_list.push(id);
    }
    
    return await recipe_utils.getRecipesPreview(req.session.user_id, await recipe_utils.joinList(lastWatched)); ;
}






exports.getRandomRecipes = getRandomRecipes;