import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';
import useModal from 'react-hooks-use-modal';


// TODO: rename to inventory dashboard 

function Inventory() {
  const [cookies, setCookie] = useCookies(['name']);
  const [inventoryRows, setInventoryRows] = useState([]);
  // const [recipeSearchRows, setRecipeSearchRows] = useState([]);
  const [inventoryAddRowsHTML, setInventoryAddRowsHTML] = useState([]);
  const [inventoryAddRowsString, setInventoryAddRowsString] = useState([]);
  const [Modal, open, close, isOpen] = useModal('root', {
    preventScroll: true
  });

  async function deleteItemPOST(item) {
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

  async function addItemsPOST() {
    var newRows = [];
    console.log(inventoryAddRowsString);
    for (var i = 0; i < inventoryAddRowsString.length; i++) {
      var itemStr = inventoryAddRowsString[i];
      newRows.push({ "title": inventoryAddRowsString[i] });
    }
    for (var i = 0; i < inventoryRows.length; i++) {
      var item = inventoryRows[i];
      if (!inventoryAddRowsString.includes(item.title)) {
        newRows.push({ "title": item.title });
      }
    }
    const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addItems", {
      method: 'POST',
      body: JSON.stringify({ "id": cookies.id, items: inventoryAddRowsString }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    setInventoryAddRowsHTML([]);
    setInventoryAddRowsString([]);
    if(document.getElementById('itemInput')){
      document.getElementById('itemInput').value = '';
    }
    setInventoryRows(newRows);
  };

  // async function saveRecipePOST(recipeId) {
  //   const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addRecipes", {
  //     method: 'POST',
  //     body: JSON.stringify({ "id": cookies.id, recipeIds: [recipeId] }),
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }
  //   });
  // };

  // async function searchRecipes() {
  //   const URL = "https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/searchRecipeWithInventory";
  //   const result = await fetch(URL, {
  //     method: 'post',
  //     body: JSON.stringify({ "id": cookies.id }),
  //   })
  //     .then(response => response.json())
  //     .then((data) => {
  //       if (data) {
  //         var i;
  //         var generatedRows = [];
  //         var recipes = JSON.parse(data.recipes);
  //         for (i = 0; i < recipes.length; i++) {
  //           var recipe = recipes[i];
  //           console.log("Ingredient name " + recipe.title);
  //           generatedRows.push({ title: recipe.title, id: recipe.id });
  //         }
  //         setRecipeSearchRows(generatedRows);
  //       }
  //     })
  // };

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
    { key: "title", name: "Ingredient name" },
  ];

  // const recipeSearchColumns = [
  //   { key: "title", name: "Title" }
  // ];

  function getInventoryCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            if (window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved inventory?")) {
              alert("fine, deleting " + row.title);
              const deletePOST = deleteItemPOST(row.title);
            }
          }
        }
      ]);
    }
    return null;
  }

  // function getSearchCellActions(column, row) {
  //   if (column.key == "title") {
  //     return ([
  //       {
  //         icon: <span className="glyphicon glyphicon-bookmark" />,
  //         callback: () => {
  //           alert(row.title + " was added to your saved recipes list");
  //           saveRecipePOST(row.id);
  //         }
  //       },
  //       {
  //         icon: <span className="glyphicon glyphicon-info-sign" />,
  //         callback: () => {
  //           window.location = `../recipePage?recipeId=${row.id}`;
  //         }
  //       }
  //     ]
  //     );
  //   }
  //   return null;
  // }

  function editInventoryAddRows(text) {
    var newRowsHTML = [];
    var newRowsString = [];
    if (text != "") {
      var splitText = text.split(",");
      for (var i = 0; i < splitText.length; i++) {
        var item = splitText[i].trim();
        newRowsHTML.push(<ListGroup.Item>{item}</ListGroup.Item>);
        newRowsString.push(item);
      }
    }
    setInventoryAddRowsHTML(newRowsHTML);
    setInventoryAddRowsString(newRowsString);
  }

  var returnHTML = [];
  if (inventoryRows) {
    const headerRowHeight = 50;
    const rowHeight = 50;
    const totalInventoryHeight = headerRowHeight + (rowHeight * inventoryRows.length);
    return (<div>
      <div style={{display: "flex","justify-content": "space-between"}}>
      <h1 style={{ "margin-top": "50px" }}> Current inventory</h1>
      <button class="btn btn-primary" onClick={open} style={{"height" : "30px", bottom: "0px"}}>Add items</button>
      </div>
      <ReactDataGrid id="inventoryGrid"
        columns={inventoryColumns}
        rowGetter={i => inventoryRows[i]}
        rowsCount={inventoryRows.length}
        minHeight={totalInventoryHeight}
        headerRowHeight={headerRowHeight}
        rowHeight={rowHeight}
        getCellActions={getInventoryCellActions}
      />
      <Modal style={{"margin-top" : "100px"}}>
        <div style={{backgroundColor: "white", "padding" : "5px"}}>  
        <div style={{display: "flex","justify-content": "space-between"}}>
        <h3 style={{"margin-right" : "100px"}}>Items to add: </h3>  
        <button type="submit" class="btn btn-outline-secondary" onClick={() => {
          addItemsPOST();
          close();
        }
        }>Add</button>
        </div>
        <input type="text" id="itemInput" onChange={(event) => editInventoryAddRows(event.target.value)} />
        {inventoryAddRowsHTML.length > 0 &&
          <ListGroup>
            {inventoryAddRowsHTML}
          </ListGroup>
        }
        </div>
      </Modal>

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

export default Inventory; 
