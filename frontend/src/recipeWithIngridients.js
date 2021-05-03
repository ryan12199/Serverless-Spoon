import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';

const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="50" height="50" />;
};

function Inventory() {
  const [cookies, setCookie] = useCookies(['name']);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [recipeSearchRows, setRecipeSearchRows] = useState([]);

  

 
  async function saveRecipePOST(recipeId) {
    const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addRecipes", {
      method: 'POST',
      body: JSON.stringify({ "id": cookies.id, recipeIds: [recipeId] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  async function searchRecipes() {
    const URL = "https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/searchRecipeWithInventory";
    const result = await fetch(URL, {
      method: 'post',
      body: JSON.stringify({ "id": cookies.id }),
    })
      .then(response => response.json())
      .then((data) => {
        if (data) {
          var i;
          var generatedRows = [];
          var recipes = JSON.parse(data.recipes);
          for (i = 0; i < recipes.length; i++) {
            var recipe = recipes[i];
            console.log("title " + recipe.title);
            generatedRows.push({ title: recipe.title, id: recipe.id });
          }
          setRecipeSearchRows(generatedRows);
        }
      })
  };

  useEffect(() => {
    const getItemsURL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getItems?id=${cookies.id}`;
    fetch(getItemsURL)
      .then(response => response.json())
      .then((data) => {
        if (data) {
          var i;
          var generatedRows = [];
          var inventory = data.inventory;
          for (i = 0; i < inventory.length; i++) {
            var item = inventory[i];
            generatedRows.push({ title: item });
          }
          setInventoryRows(generatedRows);
        }
      })
  }, []);



  const recipeSearchColumns = [
    { key: "title", name: "Title" }
  ];


  function getSearchCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-bookmark" />,
          callback: () => {
            alert(row.title + " was added to your saved recipes list");
            saveRecipePOST(row.id);
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

    return (<div>
      <h2>Here are recipies you can cook</h2>
      <button onClick={() => searchRecipes()}>show recipes</button>
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

export default Inventory; 
