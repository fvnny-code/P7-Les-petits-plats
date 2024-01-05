let allRecipes = [];
const selectedIngredientsSet = new Set();
const selectedApplianceSet = new Set();
const selectedUstensilsSet = new Set();

async function getDataJson() {
  const response = await fetch("data/recipes.json");
  allRecipes = (await response.json()).recipes;

  init();
}

/** Recipe cars generation
 *
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
                  : i.quantity
                  ? `<p class="quantity">${i.quantity}</p>`
                  : ""
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
/**
 * Filters implementation
 */
function getDropdown(data) {
  return `
  ${data
    .map(
      (i) => `
  <li><a href="#">${i}</a></li>
  `
    )
    .join("")}
  `;
}
/**
 * Display cards
 */
function displayData(recipes) {
  const recipeSection = document.getElementById("recipes__cards");
  recipeSection.innerHTML = "";
  recipes.forEach((recipe) => {
    const recipeCard = getRecipeCard(recipe);
    recipeSection.innerHTML += recipeCard;
  });
}
/**
 * Display filters
 */
function displayDropdown(recipes) {
  const ingredientsSet = new Set();
  const applianceSet = new Set();
  const ustensilsSet = new Set();

  recipes.forEach((recipe) => {
    recipe.ingredients
      .map((i) => i.ingredient)
      .forEach((i) => {
        if (!selectedIngredientsSet.has(i)) {
          ingredientsSet.add(i);
        }
      });

    applianceSet.add(recipe.appliance);

    recipe.ustensils.forEach((u) => {
      ustensilsSet.add(u);
    });
  });
  const ingredientsList = getDropdown([...ingredientsSet]);
  document.getElementById("ingredients__list").innerHTML = ingredientsList;

  const applianceList = getDropdown([...applianceSet]);
  document.getElementById("appliance__list").innerHTML = applianceList;

  const ustensilsList = getDropdown([...ustensilsSet]);
  document.getElementById("ustensils__list").innerHTML = ustensilsList;
}

/**
 * Remove diacritics.
 */
const normalize = (originalText) =>
  originalText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Searchbar alogrithm, case 1 :
 * normalize string values
 * check if filter includes recipe name, description and ingredient.
 */

const searchInput = document.getElementById("inputSearchBar");

const search = () => {
  let currentRecipes = allRecipes;
  const value = normalize(searchInput.value.trim());

  if (value.length >= 3) {
    currentRecipes = currentRecipes.filter((recipe) => {
      if (
        normalize(recipe.name).includes(value) ||
        normalize(recipe.description).includes(value)
      ) {
        return true;
      }
      recipe.ingredients.forEach((ingredient) => {
        if (normalize(ingredient.ingredient).includes(value)) {
          return true;
        }
      });
      return false;
    });
  }
  if (value.length === 0) {
  }

/**
 * prendre en compte les éléments sélectionnés refiltrer currentRecipes() pour vérifier si ingredient sélectionné fait partie de la liste de la recette en cours.
 *
 *  currentRecipes = currentRecipes.fitler((recipe)){
 * if(
 * normalize(selectedIngredientsSet).includes(value) ||
 * normalize(selectedApplianceSet).includes(value) ||
 * normalize(selectedUstensilsSet).includes(value)
 * 
 * ){
 * return true
 * }
 * return false
 * };
 */

  displayData(currentRecipes);
  displayDropdown(currentRecipes);

  /**
   * Reprendre le principe de search pour ingrédients, unstensiles, appareils :
   * si >= 1 caractère filtre Sinon on affiche tout.
   */
  
  const ingredientsListByUl = document.getElementById("ingredients__list");
  const ingredientsListByLi = ingredientsListByUl.children;
  for (let li of ingredientsListByLi) {
    li.addEventListener("click", (event) => {
      // console.log(li.textContent);
      selectedIngredientsSet.add(li.textContent);
      DisplaySelectedIngredients();
      search();
    });
  }
};

function DisplaySelectedIngredients() {
  const selectedTagsContainer = document.querySelector(
    ".tag__ingredients--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  selectedIngredientsSet.forEach((ingredient) => {
    const html = `
    <div class="tag">
    <p>${ingredient}</p>
    <p>X</p>
    </div>
    `;
    selectedTagsContainer.innerHTML += html;
  });
}

searchInput.addEventListener("input", (event) => {
  const value = event.target.value;
  setTimeout(() => {
    if (value === searchInput.value) {
      search();
    }
  }, 300);
});

function init() {
  displayData(allRecipes);
  displayDropdown(allRecipes);
}

getDataJson();
