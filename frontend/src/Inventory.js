import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';

const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="50" height="50"/>;
};

function ImageFormatter({ value }) {
  return (
    <div className="rdg-image-cell-wrapper">
     <img src={value}/>
    </div>
  );}

function Inventory() {
    const [cookies, setCookie] = useCookies(['name']);
    const [rows, setRows] = useState([]);
    const [items, setItems] = useState([]);

    
    const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getItems?id=${cookies.id}`;
    console.log(URL);
    useEffect(() => {
        fetch(URL)
            .then(response => response.json())
            .then((data)=>{
                if(data){
                    var i;
                    var generatedItems = [];
                    var inventory = data.inventory;
                    for(i=0;i<inventory.length;i++){
                      var item = inventory[i];
                      generatedItems.push(<ListGroup.Item>{item}</ListGroup.Item>);
                    }
                    setItems(generatedItems);
                }
            })
    }, []);

return( <div>
  <h2>Inventory Page</h2> 
  <ListGroup>
  {items}
  </ListGroup>
  </div>
)

}

export default Inventory; 
