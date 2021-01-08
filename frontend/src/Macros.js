import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import {
    CircularProgressbar,
    CircularProgressbarWithChildren,
    buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "react-bootstrap";
import Form from 'react-bootstrap/Form';


function Macros() {
    const [cookies, setCookie] = useCookies(['name']);
    const [data, setData] = useState(null);
    const [addCaloriesValue, setAddCalories] = useState(0);
    const [addFatValue, setAddFat] = useState(0);
    const [addCarbsValue, setAddCarbs] = useState(0);
    const [addProteinValue, setAddProtein] = useState(0);

    async function addMacrosPOST() {
            var intCal = parseInt(addCarbsValue);
            var intCarbs = parseInt(addCarbsValue);
            var intFat = parseInt(addProteinValue);
            var intProt = parseInt(addFatValue);
        alert("adding macros");
        const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addMacros", {
            method: 'POST',
            body: JSON.stringify({ "id": cookies.id, calories: intCal, fat: intFat, carbs: intCarbs, protein: intProt }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async function saveRecipePOST(recipeId) {
        const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addRecipes", {
            method: 'POST',
            body: JSON.stringify({ "id": cookies.id, recipeIds: [recipeId] }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };





    console.log(URL);
    useEffect(() => {
        const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getMacros?id=${cookies.id}`;
        fetch(URL)
            .then(response => response.json())
            .then(setData)

    }, []);

    if (data) {
        return (
            <div>
                <h2>Macros Page</h2>
                <h1>Hello {cookies.id}!</h1>
                <h1>{JSON.stringify(data)}</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="caloriesInput">Calories</label>
                        <input type="number" className="form-control" id="caloriesInput" onChange={(event) => setAddCalories(event.target.value)} placeholder="Calories in your meal" />
                        <label htmlFor="fatInput">Fat</label>
                        <input type="number" className="form-control" id="fatInput" onChange={(event) => setAddFat(event.target.value)} placeholder="Fat (in grams)" />
                        <label htmlFor="carbsInput">carbsInput</label>
                        <input type="number" className="form-control" id="carbsInput" onChange={(event) => setAddCarbs(event.target.value)} placeholder="Carbs (in grams)" />
                        <label htmlFor="proteinInput">Protein</label>
                        <input type="number" className="form-control" id="proteinInput" onChange={(event) => setAddProtein(event.target.value)} placeholder="Protein (in grams)" />
                    </div>
                    <button class="btn btn-primary" onClick={() => addMacrosPOST()} type="submit">Add macros</button>
                </form>
            </div>)
    }
    else {
        return (<div>
            <h2>Macros Page</h2>
            <h1>Hello {cookies.id}!</h1>
            <h2>No data available</h2>
        </div>)
    }
}

export default Macros; 
