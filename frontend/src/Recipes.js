import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect, useReducer } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";


const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="50" height="50" />;
};


function Recipes() {
  const [cookies, setCookie] = useCookies(['name']);
  const [savedRecipesRows, setSavedRecipesRows] = useState([]);  
  const [recipeSearchRows, setRecipeSearchRows] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getRecipes?id=${cookies.id}`;
    fetch(URL)
      .then(response => response.json())
      .then((data) => {
        if (data) {
          var i;
          var generatedRows = [];
          var recipes = data.savedRecipes;
          for (i = 0; i < recipes.length; i++) {
            var recipe = recipes[i];
            var cuisineString = "N/A";
            if (recipe.cuisines.length) {
              cuisineString = recipe.cuisines.toString();
            }
            var dietsString = "N/A";
            if (recipe.diets.length) {
              dietsString = recipe.diets.toString();
            }
            generatedRows.push({ title: recipe.title, cuisines: cuisineString, diets: dietsString, healthscore: recipe.healthScore, cookingTime: recipe.readyInMinutes, id:recipe.id});
          }
          setSavedRecipesRows(generatedRows);
        }
      })
  }, []);

  async function searchRecipes() {
    const URL = "https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/searchRecipeWithQuery";
    const result = await fetch(URL, {
      method: 'post',
      body: JSON.stringify({ "id": cookies.id, query: query }),
    })
      .then(response => response.json())
      .then((data) => {
        if (data) {
          var i;
          var generatedRows = [];

          var recipes = JSON.parse(data.recipes).results;
          for (i = 0; i < recipes.length; i++) {
            var recipe = recipes[i];
            console.log("title " + recipe.title);
            generatedRows.push({ title: recipe.title, id: recipe.id });
          }
          setRecipeSearchRows(generatedRows);
          document.getElementById('recipeQuery').value = '';
        }
      })
  };

  async function functionSendDeleteRecipe(recipeId){
    const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/removeRecipes", {
      method: 'POST',
      body: JSON.stringify({"id" : cookies.id, recipeIds : [recipeId]}),
      headers: {
        'Content-Type' : 'application/json'
      }
    });
    var newRows = [];
    var i;
    for(i=0; i<savedRecipesRows.length; i++){
      var row = savedRecipesRows[i];
      if(row.id!=recipeId){
        newRows.push(row);
      }
    }
    setSavedRecipesRows(newRows);
    // setRows([]);
    const body = await result.json();
    console.log(body);
    return body;
  };

  async function saveRecipePOST(recipeId, recipeTitle) {
    const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addRecipes", {
      method: 'POST',
      body: JSON.stringify({ "id": cookies.id, recipeIds: [recipeId] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
   var newRows = []; 
   for(var i=0; i<savedRecipesRows.length; i++){
     var id = savedRecipesRows[i].id;
     if(id!=recipeId){
        newRows.push(savedRecipesRows[i]);
     }
   }
   newRows.push({"title" : recipeTitle, diets: "Refresh page", cuisines: "Refresh page", cookingTime: "Refresh Page", healthscore: 0});
   setSavedRecipesRows(newRows); 
  };

  const savedRecipeColumns = [
    { key: "title", name: "Title" },
    { key: "cuisines", name: "Cuisines" },
    { key: "diets", name: "Diets" },
    { key: "cookingTime", name: "Cooking Time (Minutes)" },
    { key: "healthscore", name: "Health Score", formatter: ProgressBarFormatter }
  ];

  function getSavedCellActions(column, row) {
    if(column.key=="title"){
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            if(window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved recipes?")){
              const deletePOST = functionSendDeleteRecipe(row.id);
            }
          }
        },
        {
          icon: <span className="glyphicon glyphicon-info-sign" />,
          callback: () => {
            window.location = `../recipePage?recipeId=${row.id}`;
          }
        }
      ]
      );
    }
    return null;
  }
  function getSearchCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-bookmark" />,
          callback: () => {
            alert(row.title + " was added to your saved recipes list");
            saveRecipePOST(row.id, row.title);
          }
        },
        {
          icon: <span className="glyphicon glyphicon-info-sign" />,
          callback: () => {
            window.location = `../recipePage?recipeId=${row.id}`;
          }
        }
      ]
      );
    }
    return null;
  }
  const recipeSearchColumns = [
    { key: "title", name: "Title" }
  ];


  if (savedRecipesRows) {
    const headerRowHeight = 50;
    const rowHeight = 50; 
    const totalHeight = headerRowHeight + (rowHeight*savedRecipesRows.length);

    console.log(`row count ${savedRecipesRows.length}`);
    return (
    <div>
      <h1>Recipes Page</h1>
      <ReactDataGrid
        columns={savedRecipeColumns}
        rowGetter={i => savedRecipesRows[i]}
        rowsCount={savedRecipesRows.length}
        minHeight={totalHeight}
        headerRowHeight={headerRowHeight}
        rowHeight={rowHeight}
        getCellActions={getSavedCellActions}
      />
      <input type="text" id="recipeQuery" onChange={(event) => setQuery(event.target.value)} />
      <button type="submit" onClick={() => searchRecipes()} className="btn btn-primary">Search recipe</button>
      { recipeSearchRows.length > 0 &&
        <ReactDataGrid id="recipeSearchGrid"
          columns={recipeSearchColumns}
          rowGetter={i => recipeSearchRows[i]}
          rowsCount={recipeSearchRows.length}
          getCellActions={getSearchCellActions}
        />
      }

    </div>)
  }
  else {
    return (<div>
      <h2>Recipes Page</h2>
      <h1>Hello {cookies.id}!</h1>
      <h2>No data available</h2>
    </div>)
  }
}

export default Recipes; 
