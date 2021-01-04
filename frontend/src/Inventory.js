import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';

const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="50" height="50" />;
};

function ImageFormatter({ value }) {
  return (
    <div className="rdg-image-cell-wrapper">
      <img src={value} />
    </div>
  );
}

function Inventory() {
  const [cookies, setCookie] = useCookies(['name']);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [recipeSearchRows, setRecipeSearchRows] = useState([]);

  async function functionSendDeleteItem(item) {
    const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/removeItems", {
      method: 'POST',
      body: JSON.stringify({ "id": cookies.id, items: [item] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    var newRows = [];
    var i;
    for (i = 0; i < inventoryRows.length; i++) {
      var row = inventoryRows[i];
      if (row.title != item) {
        newRows.push(row);
      }
    }
    setInventoryRows(newRows);
    const body = await result.json();
    console.log(body);
    return body;
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
            generatedRows.push({ title: recipe.title, image: recipe.image, id: recipe.id });
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

  const inventoryColumns = [
    { key: "title", name: "Title" },
  ];

  const recipeSearchColumns = [
    { key: "title", name: "Title" },
    {
      key: 'image',
      name: 'Image',
      width: 40,
      resizable: true,
      formatter: ({ row }) => <ImageFormatter value={row.image} />
    }
  ];


  function getInventoryCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            if (window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved inventory?")) {
              alert("fine, deleting " + row.title);
              const deletePOST = functionSendDeleteItem(row.title);
            }
          }
        }
      ]);
    }
    return null;
  }


  function getSearchCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-floppy-disk" />,
          callback: () => {
            if (window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved inventory?")) {
              alert("fine, deleting " + row.title);
              const deletePOST = functionSendDeleteItem(row.title);
            }
          }
        }
      ]);
    }
    return null;
  }


  if (inventoryRows) {
    return (<div>
      <h2>Recipes Page</h2>
      <ReactDataGrid id="inventoryGrid"
        columns={inventoryColumns}
        rowGetter={i => inventoryRows[i]}
        rowsCount={inventoryRows.length}
        getCellActions={getInventoryCellActions}
      />
      <h1>Hello {cookies.id}!</h1>
      <h2>Here are recipies you can cook</h2>
      <button onClick={() => searchRecipes()}>show recipes</button>
      <ReactDataGrid id="recipeSearchGrid"
        columns={recipeSearchColumns}
        rowGetter={i => recipeSearchRows[i]}
        rowsCount={recipeSearchRows.length}
        getCellActions={getSearchCellActions}
      />
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



//     const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getItems?id=${cookies.id}`;
//     console.log(URL);
//     useEffect(() => {
//         fetch(URL)
//             .then(response => response.json())
//             .then((data)=>{
//                 if(data){
//                     var i;
//                     var generatedItems = [];
//                     var inventory = data.inventory;
//                     for(i=0;i<inventory.length;i++){
//                       var item = inventory[i];
//                       generatedItems.push(<ListGroup.Item>{item}</ListGroup.Item>);
//                     }
//                     setItems(generatedItems);
//                 }
//             })
//     }, []);

// return( <div>
//   <h2>Inventory Page</h2> 
//   <ListGroup>
//   {items}
//   </ListGroup>
//   </div>
// )

// }

export default Inventory; 
