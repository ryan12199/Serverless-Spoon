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
  const [rows, setRows] = useState([]);  

  const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getRecipes?id=${cookies.id}`;
  console.log(URL);
  useEffect(() => {
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
          setRows(generatedRows);
        }
      })
  }, []);


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
    for(i=0; i<rows.length; i++){
      var row = rows[i];
      if(row.id!=recipeId){
        newRows.push(row);
      }
    }
    setRows(newRows);
    // setRows([]);
    const body = await result.json();
    console.log(body);
    return body;
  };

  const columns = [
    { key: "title", name: "Title" },
    { key: "cuisines", name: "Cuisines" },
    { key: "diets", name: "Diets" },
    { key: "cookingTime", name: "Cooking Time (Minutes)" },
    { key: "healthscore", name: "Health Score", formatter: ProgressBarFormatter }
  ];

  function getCellActions(column, row) {
    if(column.key=="title"){
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            if(window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved recipes?")){
              alert("fine, deleting " + row.id);
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

  if (rows) {
    const headerRowHeight = 50;
    const rowHeight = 50; 
    const totalHeight = headerRowHeight + (rowHeight*rows.length);

    console.log(`row count ${rows.length}`);
    return (<div>
      <h2>Recipes Page</h2>
      <ReactDataGrid
        columns={columns}
        rowGetter={i => rows[i]}
        rowsCount={rows.length}
        minHeight={totalHeight}
        headerRowHeight={headerRowHeight}
        rowHeight={rowHeight}
        getCellActions={getCellActions}

      />
      <h1>Hello {cookies.id}!</h1>
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
