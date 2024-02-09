let allRecipes = [];

const ingredientsSet = new Set();
const appliancesSet = new Set();
const ustensilsSet = new Set();

const selectedIngredientsSet = new Set();
const selectedApplianceSet = new Set();
const selectedUstensilsSet = new Set();

async function getDataJson() {
  const response = await fetch("data/recipes.json");
  allRecipes = (await response.json()).recipes;
  init();
}

/**
 * Implémentation des recipe cards
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
 * Implementation des filtres dropdowns
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
 * Suppression des signes diacritiques.
 */
const normalize = (originalText) =>
  originalText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 *  Alogrithme de la barre de recherche cas 2 :
 * normalisation des valeurs de chaînes de caractères
 * Vérification si le filtre inclut le nom de la recette, sa description et ingrédients
 */
const searchInput = document.getElementById("inputSearchBar");
const search = () => {
  let currentRecipes = allRecipes;
  const value = normalize(searchInput.value.trim());

  if (value.length >= 3) {
    const filteredRecipes = [];
    for (recipe of currentRecipes) {
      if (
        normalize(recipe.name).includes(value) ||
        normalize(recipe.description).includes(value)
      ) {
        filteredRecipes.push(recipe);
        continue;
      }
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredient = recipe.ingredients[i];
        if (normalize(ingredient.ingredient).includes(value)) {
          filteredRecipes.push(recipe);
          continue;
        }
      }
    }
    currentRecipes = filteredRecipes;
  }
  if (value.length === 0) {
  }

  /**
   * refiltrage des élements sélectionnés currentRecipes(),
   * pour vérifier si l'ingredient sélectionné fait partie de la liste de la recette en cours.
   * Idem pour Appliances et ustensils.
   */

  const filteredRecipesByIngredients = [];
  for (const recipe of currentRecipes) {
    let isOk = true;
    for (const selectedIngredient of selectedIngredientsSet) {
      let found = false;
      for (const ingredient of recipe.ingredients) {
        if (ingredient.ingredient.includes(selectedIngredient)) {
          found = true;
          break;
        }
      }
      if (!found) {
        isOk = false;
      }
    }
    if (isOk) {
      filteredRecipesByIngredients.push(recipe);
    }
  }
  currentRecipes = filteredRecipesByIngredients;

  const filteredRecipesByAppliances = [];
  for (const recipe of currentRecipes) {
    let isOk = true;
    for (const selectedAppliance of selectedApplianceSet) {
      let found = false;

      if (recipe.appliance.includes(selectedAppliance)) {
        found = true;
        break;
      }
      if (!found) {
        isOk = false;
        break; // Sortir de la boucle dès qu'une appliance n'est pas trouvée
      }
    }
    if (isOk) {
      filteredRecipesByAppliances.push(recipe);
    }
  }

  currentRecipes = filteredRecipesByAppliances;
  const filteredRecipesByUstensils = [];
  for (const recipe of currentRecipes) {
    let isOk = true;
    for (const selectedUstensil of selectedUstensilsSet) {
      let found = false;
      for (const ustensil of recipe.ustensils) {
        if (ustensil.includes(selectedUstensil)) {
          found = true;
          break;
        }
      }
      if (!found) {
        isOk = false;
        break; // Sortir de la boucle dès qu'un ustensile n'est pas trouvé
      }
    }
    if (isOk) {
      filteredRecipesByUstensils.push(recipe);
    }
  }
  currentRecipes = filteredRecipesByUstensils;

  displayData(currentRecipes);
  displayDropdown(currentRecipes);
  DisplayFilteredRecipesNumber(currentRecipes.length);

  /**
   * Mise en mémoire des éléments disponibles pour la recherche dans les dropdowns
   */
  ingredientsSet.clear();
  appliancesSet.clear();
  ustensilsSet.clear();

  // Parcourir chaque recette pour extraire les éléments disponibles
  for (const recipe of currentRecipes) {
    // Parcourir les ingrédients de la recette et les ajouter à ingredientsSet
    for (const ingredient of recipe.ingredients) {
      ingredientsSet.add(ingredient.ingredient);
    }
    // Ajouter l'appareil de la recette à appliancesSet
    appliancesSet.add(recipe.appliance);

    // Parcourir les ustensiles de la recette et les ajouter à ustensilsSet
    for (const ustensil of recipe.ustensils) {
      ustensilsSet.add(ustensil);
    }
  }

  /**
   * Reprendre le principe de search() pour la liste d'ingrédients, ustensiles, appareils :
   * si >= 1 caractère  on filtre Sinon on affiche tout.
   */
  const ingredientsListByUl = document.getElementById("ingredients__list");
  const ingredientsListByLi = ingredientsListByUl.children;
  for (let li of ingredientsListByLi) {
    li.addEventListener("click", (event) => {
      selectedIngredientsSet.add(li.textContent);
      DisplaySelectedIngredients();
      search();
    });
  }
  const appliancesListByUl = document.getElementById("appliance__list");
  const appliancesListByLi = appliancesListByUl.children;
  for (let li of appliancesListByLi) {
    li.addEventListener("click", (event) => {
      selectedApplianceSet.add(li.textContent);
      DisplaySelectedAppliances();
      search();
    });
  }
  const ustensilsListByUl = document.getElementById("ustensils__list");
  const ustensilsListByLi = ustensilsListByUl.children;
  for (let li of ustensilsListByLi) {
    li.addEventListener("click", (event) => {
      selectedUstensilsSet.add(li.textContent);
      DisplaySelectedUstensils();
      search();
    });
  }
};
searchInput.addEventListener("input", (event) => {
  const value = event.target.value;
  setTimeout(() => {
    if (value === searchInput.value) {
      search();
    }
  }, 300);
});

/**
 * Affichage des filtres (dropdowns)
 */
function displayDropdown(recipes) {
  const ingredientsSet = new Set();
  const applianceSet = new Set();
  const ustensilsSet = new Set();

  // Parcourir chaque recette
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    // Parcourir chaque ingrédient de la recette
    for (let j = 0; j < recipe.ingredients.length; j++) {
      const ingredient = recipe.ingredients[j].ingredient;
      if (!selectedIngredientsSet.has(ingredient)) {
        ingredientsSet.add(ingredient);
      }
    }
    // Vérifier l'appareil de la recette
    if (!selectedApplianceSet.has(recipe.appliance)) {
      applianceSet.add(recipe.appliance);
    }
    // Parcourir chaque ustensile de la recette
    for (let k = 0; k < recipe.ustensils.length; k++) {
      const ustensil = recipe.ustensils[k];
      if (!selectedUstensilsSet.has(ustensil)) {
        ustensilsSet.add(ustensil);
      }
    }
  }
  // Générer la liste des ingrédients
  const ingredientsList = getDropdown([...ingredientsSet]);
  document.getElementById("ingredients__list").innerHTML = ingredientsList;
  // Générer la liste des appareils
  const applianceList = getDropdown([...applianceSet]);
  document.getElementById("appliance__list").innerHTML = applianceList;
  // Générer la liste des ustensiles
  const ustensilsList = getDropdown([...ustensilsSet]);
  document.getElementById("ustensils__list").innerHTML = ustensilsList;
}

/**
 * Affichage du nombre de recettes.
 */
const DisplayFilteredRecipesNumber = (NumberOfRecipes) => {
  const container = document.querySelector(".recipes-number");
  const string = NumberOfRecipes > 1 ? "recettes" : "recette";
  const html = `
    <p>${NumberOfRecipes} ${string}</p>
    `;
  container.innerHTML = html;
};

/**
 * ici reprendre le principe de search() avec tous les dropdowns :
 * quand je remplis l’input du dropdwon ingrédients, l’ingrédient correspondant est retourné.
 * Idem pour appareil et ustensiles.
 */
const searchInputIngredients = document.getElementById("searchIngredients");
const searchInputAppliances = document.getElementById("searchAppliances");
const searchInputUstensils = document.getElementById("searchUstensils");

searchInputIngredients.addEventListener("input", (event) => {
  const value = normalize(event.target.value);
  setTimeout(() => {
    if (value === searchInputIngredients.value) {
      const ingredients = [...ingredientsSet].filter((ingredient) => {
        return normalize(ingredient).includes(value);
      });
      const ingredientsList = getDropdown(ingredients);
      document.getElementById("ingredients__list").innerHTML = ingredientsList;
      const ingredientsListByUl = document.getElementById("ingredients__list");
      const ingredientsListByLi = ingredientsListByUl.children;
      for (let li of ingredientsListByLi) {
        li.addEventListener("click", (event) => {
          selectedIngredientsSet.add(li.textContent);
          DisplaySelectedIngredients();
          search();
        });
      }
    }
  }, 300);
});

searchInputAppliances.addEventListener("input", (event) => {
  const value = normalize(event.target.value);
  setTimeout(() => {
    if (value === searchInputAppliances.value) {
      const appliances = [...appliancesSet].filter((appliance) => {
        return normalize(appliance).includes(value);
      });
      const appliancesList = getDropdown(appliances);
      document.getElementById("appliance__list").innerHTML = appliancesList;
      const appliancesListByUl = document.getElementById("appliance__list");
      const appliancesListByLi = appliancesListByUl.children;
      for (let li of appliancesListByLi) {
        li.addEventListener("click", (event) => {
          selectedApplianceSet.add(li.textContent);
          DisplaySelectedAppliances();
          search();
        });
      }
    }
  }, 300);
});

searchInputUstensils.addEventListener("input", (event) => {
  const value = normalize(event.target.value);
  setTimeout(() => {
    if (value === searchInputUstensils.value) {
      const ustensils = [...ustensilsSet].filter((ustensils) => {
        return normalize(ustensils).includes(value);
      });
      const ustensilsList = getDropdown(ustensils);
      document.getElementById("ustensils__list").innerHTML = ustensilsList;
      const ustensilsListByUl = document.getElementById("ustensils__list");
      const ustensilsListByLi = ustensilsListByUl.children;
      for (let li of ustensilsListByLi) {
        li.addEventListener("click", (event) => {
          selectedUstensilsSet.add(li.textContent);
          DisplaySelectedUstensils();
          search();
        });
      }
    }
  }, 300);
});

/**
 * Affichage des tags.
 */

function DisplaySelectedIngredients() {
  const selectedTagsContainer = document.querySelector(
    ".tag__ingredients--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  // Parcourir chaque ingrédient sélectionné
  for (const ingredient of selectedIngredientsSet) {
    const html = `
    <div class="tag" data-name="${ingredient}" >
    <p>${ingredient}</p>
    <p class="delete-ingredient">X</p>
    </div>
    `;
    selectedTagsContainer.innerHTML += html;
  }

  // Ajouter des écouteurs d'événements pour chaque bouton de suppression
  const deleteIngredientButtons =
    document.querySelectorAll(".delete-ingredient");
  for (let i = 0; i < deleteIngredientButtons.length; i++) {
    const btn = deleteIngredientButtons[i];
    btn.addEventListener("click", (event) => {
      const div = event.target.parentElement;
      if (selectedIngredientsSet.has(div.dataset.name)) {
        selectedIngredientsSet.delete(div.dataset.name);
        div.remove();
        search();
      }
    });
  }
}

function DisplaySelectedAppliances() {
  const selectedTagsContainer = document.querySelector(
    ".tag__appliances--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  // Parcourir chaque appareil sélectionné
  for (const appliance of selectedApplianceSet) {
    const html = `
        <div class="tag" data-name="${appliance}" >
        <p>${appliance}</p>
        <p class="delete-appliance">X</p>
        </div>
       `;
    selectedTagsContainer.innerHTML += html;
  }
  // Ajouter des écouteurs d'événements pour chaque bouton de suppression
  const deleteApplianceButtons = document.querySelectorAll(".delete-appliance");
  for (let i = 0; i < deleteApplianceButtons.length; i++) {
    const btn = deleteApplianceButtons[i];
    btn.addEventListener("click", (event) => {
      const div = event.target.parentElement;
      if (selectedApplianceSet.has(div.dataset.name)) {
        selectedApplianceSet.delete(div.dataset.name);
        div.remove();
        search();
      }
    });
  }
}

function DisplaySelectedUstensils() {
  const selectedTagsContainer = document.querySelector(
    ".tag__ustensils--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  for (const ustensils of selectedUstensilsSet) {
    const html = `
    <div class="tag" data-name="${ustensils}" >
    <p>${ustensils}</p>
    <p class="delete-ustensils">X</p>
    </div>

    `;
    selectedTagsContainer.innerHTML += html;
  }
  // eventListener
  const deleteUstensilsButtons = document.querySelectorAll(".delete-ustensils");
  deleteUstensilsButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const div = event.target.parentElement;
      if (selectedUstensilsSet.has(div.dataset.name)) {
        selectedUstensilsSet.delete(div.dataset.name);
        div.remove();
        search();
      }
    });
  });
}

/**
 * Affichage des recipe cards
 */

function displayData(recipes) {
  const recipeSection = document.getElementById("recipes__cards");
  recipeSection.innerHTML = "";
  // Parcourir chaque recette et ajouter la carte de recette au conteneur
  const numRecipes = recipes.length;
  for (let i = 0; i < numRecipes; i++) {
    const recipeCard = getRecipeCard(recipes[i]);
    recipeSection.innerHTML += recipeCard;
  }
}
/**
 * initialisation
 */
function init() {
  displayData(allRecipes);
  displayDropdown(allRecipes);
  DisplayFilteredRecipesNumber(allRecipes.length);
  ingredientsSet.clear();
  appliancesSet.clear();
  ustensilsSet.clear();

// Parcourir chaque recette
for (let i = 0; i < allRecipes.length; i++) {
  const recipe = allRecipes[i];
  // Parcourir chaque ingrédient de la recette
  for (let j = 0; j < recipe.ingredients.length; j++) {
    const ingredient = recipe.ingredients[j].ingredient;
    ingredientsSet.add(ingredient);
  }
  // Ajouter l'appareil de la recette à l'ensemble d'appareils
  appliancesSet.add(recipe.appliance);
  // Parcourir chaque ustensile de la recette
  for (let k = 0; k < recipe.ustensils.length; k++) {
    const ustensil = recipe.ustensils[k];
    ustensilsSet.add(ustensil);
  }
}
}
getDataJson();
