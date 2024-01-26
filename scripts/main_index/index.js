let allRecipes = [];

const selectedIngredientsSet = new Set();
const selectedApplianceSet = new Set();
const selectedUstensilsSet = new Set();

const ingredientsSet = new Set();
const appliancesSet = new Set();
const ustensilsSet = new Set();

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
   * prendre en compte les éléments sélectionnés, refiltrer currentRecipes()
   * pour vérifier si l'ingredient sélectionné fait partie de la liste de la recette en cours.
   * Idem pour Appliances et ustensils.
   */

  currentRecipes = currentRecipes.filter((recipe) => {
    let isOk = true;
    selectedIngredientsSet.forEach((selectedIngredient) => {
      // si on ne trouve pas l'ingrédient sélectionné dans la recette, on ne garde pas la recette
      if (
        recipe.ingredients.find((ingredient) =>
          ingredient.ingredient.includes(selectedIngredient)
        ) == undefined
      ) {
        isOk = false;
      }
    });
    return isOk;
  });

  currentRecipes = currentRecipes.filter((recipe) => {
    let isOk = true;
    selectedApplianceSet.forEach((appliance) => {
      if (!recipe.appliance.includes(appliance)) {
        isOk = false;
      }
    });
    return isOk;
  });

  currentRecipes = currentRecipes.filter((recipe) => {
    let isOk = true;
    selectedUstensilsSet.forEach((ustensil) => {
      if (!recipe.ustensils.includes(ustensil)) {
        isOk = false;
      }
    });
    return isOk;
  });
  displayData(currentRecipes);
  displayDropdown(currentRecipes);
  DisplayFilteredRecipesNumber(currentRecipes.length);

  /**
   * Mise en mémoire des éléments disponibles pour la recherche dans les dropdowns
   */
  ingredientsSet.clear();
  appliancesSet.clear();
  ustensilsSet.clear();

  currentRecipes.forEach((recipe) => {
    recipe.ingredients
      .map((i) => i.ingredient)
      .forEach((ingredient) => {
        ingredientsSet.add(ingredient);
      });
    appliancesSet.add(recipe.appliance);
    recipe.ustensils.forEach((ustensil) => {
      ustensilsSet.add(ustensil);
    });
  });

  /**
   * Reprendre le principe de search pour ingrédients, unstensiles, appareils :
   * si >= 1 caractère filtre Sinon on affiche tout.
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
 * Display filters
 */
function displayDropdown(recipes) {
  const ingredientsSet = new Set();
  const applianceSet = new Set();
  const ustensilsSet = new Set();

  recipes.forEach((recipe) => {
    //ingredients
    recipe.ingredients
      .map((i) => i.ingredient)
      .forEach((i) => {
        if (!selectedIngredientsSet.has(i)) {
          ingredientsSet.add(i);
        }
      });
    //appliances
    if (!selectedApplianceSet.has(recipe.appliance)) {
      applianceSet.add(recipe.appliance);
    }
    //unstensils
    recipe.ustensils.forEach((u) => {
      if (!selectedUstensilsSet.has(u)) {
        ustensilsSet.add(u);
      }
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
 * ici reprendre le principe de search() avec tous les dropdowns,
 * pour que quand je remplis l’input du dropdwon  ingrédients renvoie l’ingrédient correspondant.
 * Idem pour appareil et ustensiles.
 */
const searchInputIngredients = document.getElementById("searchIngredients");
const searchInputAppliances = document.getElementById("searchAppliances");
const searchInputustensils =document.getElementById("searchUstensils");


// display number of filtered recipes
const DisplayFilteredRecipesNumber = (NumberOfRecipes) => {
  const container = document.querySelector(".recipes-number");
  const string = NumberOfRecipes > 1 ? "recettes" : "recette";
  const html = `
    <p>${NumberOfRecipes} ${string}</p>
    `;
  container.innerHTML = html;
};

function DisplaySelectedIngredients() {
  const selectedTagsContainer = document.querySelector(
    ".tag__ingredients--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  selectedIngredientsSet.forEach((ingredient) => {
    const html = `
    <div class="tag" data-name="${ingredient}" >
    <p>${ingredient}</p>
    <p class="delete-ingredient">X</p>
    </div>
    `;
    selectedTagsContainer.innerHTML += html;
  });
  // eventListener
  const deleteIngredientButtons =
    document.querySelectorAll(".delete-ingredient");
  deleteIngredientButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const div = event.target.parentElement;
      console.log(div.dataset); // on récupère un objet ayant la propriété name
      if (selectedIngredientsSet.has(div.dataset.name)) {
        selectedIngredientsSet.delete(div.dataset.name);
        div.remove();
        search();
      }
    });
  });
}

function DisplaySelectedAppliances() {
  const selectedTagsContainer = document.querySelector(
    ".tag__appliances--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  selectedApplianceSet.forEach((appliance) => {
    const html = `
    <div class="tag" data-name="${appliance}" >
    <p>${appliance}</p>
    <p class="delete-appliance">X</p>
    </div>
    `;
    selectedTagsContainer.innerHTML += html;
  });
  // eventListener
  const deleteApplianceButtons = document.querySelectorAll(".delete-appliance");
  deleteApplianceButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const div = event.target.parentElement;
      console.log(div.dataset); // on récupère un objet ayant la propriété name
      if (selectedApplianceSet.has(div.dataset.name)) {
        selectedApplianceSet.delete(div.dataset.name);
        div.remove();
        search();
      }
    });
  });
}

function DisplaySelectedUstensils() {
  const selectedTagsContainer = document.querySelector(
    ".tag__ustensils--wrapper"
  );
  selectedTagsContainer.innerHTML = "";
  selectedUstensilsSet.forEach((ustensils) => {
    const html = `
    <div class="tag" data-name="${ustensils}" >
    <p>${ustensils}</p>
    <p class="delete-ustensils">X</p>
    </div>

    `;
    selectedTagsContainer.innerHTML += html;
  });
  // eventListener
  const deleteUstensilsButtons = document.querySelectorAll(".delete-ustensils");
  deleteUstensilsButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const div = event.target.parentElement;
      console.log(div.dataset); // on récupère un objet ayant la propriété name
      if (selectedUstensilsSet.has(div.dataset.name)) {
        selectedUstensilsSet.delete(div.dataset.name);
        div.remove();
        search();
      }
    });
  });
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

function init() {
  displayData(allRecipes);
  displayDropdown(allRecipes);
  DisplayFilteredRecipesNumber(allRecipes.length);
  ingredientsSet.clear();
  appliancesSet.clear();
  ustensilsSet.clear();

  allRecipes.forEach((recipe) => {
    recipe.ingredients
      .map((i) => i.ingredient)
      .forEach((ingredient) => {
        ingredientsSet.add(ingredient);
      });  
    appliancesSet.add(recipe.appliance);
    recipe.ustensils.forEach((ustensil) => {
      ustensilsSet.add(ustensil);
    });
  });
}

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

searchInputustensils.addEventListener("input", (event) => {
  const value = normalize(event.target.value);
  setTimeout(() => {
    if (value === searchInputustensils.value) {
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
getDataJson();
