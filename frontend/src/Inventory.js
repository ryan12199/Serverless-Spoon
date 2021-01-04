import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';


function Inventory() {
    const [cookies, setCookie] = useCookies(['name']);
    const [rows, setRows] = useState([]);
    // const [items, setItems] = useState([]);

    async function functionSendDeleteItem(item){
      const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/removeItems", {
        method: 'POST',
        body: JSON.stringify({"id" : cookies.id, items : [item]}),
        headers: {
          'Content-Type' : 'application/json'
        }
      });
      var newRows = []; 
      var i;
      for(i=0; i<rows.length; i++){
        var row = rows[i];
        if(row.title!=item){
          newRows.push(row);
        }
      }
      setRows(newRows);
      // setRows([]);
      const body = await result.json();
      console.log(body);
      return body;
    };


    const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getItems?id=${cookies.id}`;
    useEffect(() => {
      fetch(URL)
        .then(response => response.json())
        .then((data) => {
          if (data) {
            var i;
            var generatedRows = [];
            var inventory = data.inventory;
            for (i = 0; i < inventory.length; i++) {
              var item = inventory[i];
              generatedRows.push({ title: item});
            }
            setRows(generatedRows);
          }
        })
    }, []);

    const columns = [
      { key: "title", name: "Title" },
    ];

  
    function getCellActions(column, row) {
      if(column.key=="title"){
        return ([
          {
            icon: <span className="glyphicon glyphicon-remove" />,
            callback: () => {
              if(window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved inventory?")){
                alert("fine, deleting " + row.title);
                const deletePOST = functionSendDeleteItem(row.title);
              }
            }
          }
        ]);
      }
      return null;
    }


    if (rows) {
      return (<div>
        <h2>Recipes Page</h2>
        <ReactDataGrid
          columns={columns}
          rowGetter={i => rows[i]}
          rowsCount={rows.length}
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
