const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";





async function getRandomRecipes() {
    let res = await axios.get(`${api_domain}/random`, {
        params: {
            apiKey: process.env.spooncular_apiKey,
            number: 3,
        },
    })
    return res;
}




exports.getRandomRecipes = getRandomRecipes;