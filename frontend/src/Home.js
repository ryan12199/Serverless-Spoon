import React from 'react';
import { useCookies } from 'react-cookie';
import { useState,useEffect,useRef } from "react";
import ReactDataGrid from "react-data-grid";

import { ProgressBar } from "react-bootstrap";


const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="50" height="50"/>;
};

function ImageFormatter({ value }) {
  return (
    <div className="rdg-image-cell-wrapper">
     <img src={value}/>
    </div>
  );}

const columns = [
  { key: "id", name: "ID" },
  { key: "title", name: "Title" },
  { key: "complete", name: "Complete", formatter: ProgressBarFormatter },
  {    key: 'avatar',
  name: 'Image',
  width: 40,
  resizable: true,
  formatter: ({ row }) => <ImageFormatter value={row.avatar} />}
];

const rows = [
  { id: 0, title: "Task 1", complete: 20, avatar:"https://spoonacular.com/cdn/ingredients_100x100/salt.jpg"  },
  { id: 1, title: "Task 2", complete: 40, avatar:"https://spoonacular.com/cdn/ingredients_100x100/salt.jpg"   },
  { id: 2, title: "Task 3", complete: 60, avatar:"https://spoonacular.com/cdn/ingredients_100x100/salt.jpg"   }
];


function Home (){
  const [cookies, setCookie] = useCookies(['name']);
  const [id, setId] = useState('');
  const [userData, setUserData] = useState(null);
  const [rows, setRows] = useState([]);


  async function searchUser(){
    setCookie("id", id, {});
    const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getUser?id=${id}`;
    const result = await fetch(URL, {
        method: 'get',
      });
      const body = await result.json();
      setUserData(body);
    }

  return (
    <div>
    <button onClick={() => searchUser()}>Search user</button>
    <label>
      ID:
      <input type = "ID" value = {id} onChange={(event) => setId(event.target.value)}/>
    </label>
    {userData&&
        <h2>
          {JSON.stringify(userData)}
        </h2>
      }
    </div>
  );
}

export default Home;