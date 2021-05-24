import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';
import useModal from 'react-hooks-use-modal';


// TODO: rename to inventory dashboard 

function InventoryDashboard() {
  const [cookies, setCookie] = useCookies(['name']);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [inventoryAddRowsHTML, setInventoryAddRowsHTML] = useState([]);
  const [inventoryAddRowsString, setInventoryAddRowsString] = useState([]);
  const [Modal, open, close, isOpen] = useModal('root', {
    preventScroll: true
  });


  useEffect(() => {
    setInventoryAddRowsHTML([])
    setInventoryAddRowsString([]);
  }, [isOpen]); // Only re-run the effect if count changes

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

  function getInventoryCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            const deletePOST = deleteItemPOST(row.title);
            // if (window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved inventory?")) {
            //   const deletePOST = deleteItemPOST(row.title);
            // }
          }
        }
      ]);
    }
    return null;
  }

  function editInventoryAddRows(text) {
    var newRowsHTML = [];
    var newRowsString = [];
    if (text != "") {
      var splitText = text.split(",");
      for (var i = 0; i < splitText.length; i++) {
        var item = splitText[i].trim();
        if(item==""){ continue}
        newRowsHTML.push(<ListGroup.Item>{item}</ListGroup.Item>);
        newRowsString.push(item);
      }
    }
    setInventoryAddRowsHTML(newRowsHTML);
    setInventoryAddRowsString(newRowsString);
  }

  function handleKeyDown(event){
    if (event.key === 'Enter'){
      addItemsPOST();
      close();
    }
  }

  var returnHTML = [];
  if (inventoryRows) {
    const headerRowHeight = 50;
    const rowHeight = 50;
    const totalInventoryHeight = headerRowHeight + (rowHeight * inventoryRows.length);
    return (<div>
      <div style={{display: "flex","justify-content": "space-between"}}>
      <h1 style={{ "margin-top": "50px" }}> Current inventory</h1>
      <button class="btn btn-primary" onClick={open} style={{"height" : "30px", "margin-top" : "55px"}}>Add items</button>
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
        <div style={{backgroundColor: "white", "padding" : "2px"}}>  
        <h2 style={{"margin-right" : "100px"}}>Add Items</h2>  
        <h5 style={{"color" : "#403e3e"}}> Comma seperated, press enter to confirm</h5>  
        <input style={{"width" : "100%"}} type="text" onKeyDown={(event) => handleKeyDown(event)} autocomplete="off" id="itemInput" onChange={(event) => editInventoryAddRows(event.target.value)} />
        {inventoryAddRowsHTML.length > 0 &&
          <ListGroup>
            {inventoryAddRowsHTML}
          </ListGroup>
        }
        </div>
      </Modal>

    </div>)
  }
}

export default InventoryDashboard; 
