
let recipes = [];

async function getDataJson() {
  const response = await fetch ('data/recipes.json');
  recipes = (await response.json()).recipes;

  init();
}

/** Recipe cars generation
 * getRecipeCard is used in index.js
 */
function getRecipeCard(data) {
    const { image, name, ingredients, time, description, appliance, ustensils } =
      data;
  
    const imgUrl = `/assets/Photos/${image}`;
  
    return `
      <article>
      <div class="image-space">
      <img src="${imgUrl}"/>
        <div class="duration-wrapper">
          <p class="duration">${time} minutes</p>
        </div>
      </div>
      <div class="article-header">
        <h2 class="nom">${name}</h2>
      </div>
      <div
        class="informations"
        apliance="${appliance}"
        ustensils="${ustensils.join(", ")}"
      >
        <div class="description">
          <h3>recette</h3>
          <p>${description}</p>
        </div>
        <div class="ingredients__detailled--bloc">
            <h3>ingrédients</h3>
            <div class="ingredient-wrapper">
            ${ingredients
              .map(
                (i) => `
            <div class="ingredient-item">
              <p class="ingredient">${i.ingredient}</p>
              ${
                i.quantity && i.unit
                  ? `<p class="quantity">${i.quantity} <span class="unit">${i.unit}</span></p>`
                  :( i.quantity
                  ? `<p class="quantity">${i.quantity}</p>`
                  : "")
              }
            </div>
            `
              )
              .join("")}
            
          </div>
        </div>
      </div>
  
    </article>
      `;
  }
  
/*** Display cards ***/
function displayData(recipes) {
  const recipeSection = document.getElementById('recipes__cards');
  recipeSection.innerHTML = '';

  recipes.forEach((recipe)=>{
    const recipeCard = getRecipeCard(recipe);
    recipeSection.innerHTML += recipeCard;
  })
  
}

function init(){
   /* Display recipes */ 
   displayData(recipes);
   console.log(recipes);

}

getDataJson();