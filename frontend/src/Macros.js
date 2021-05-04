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

    const [calorieGoalValue, setCalorieGoalValue] = useState(0);
    const [fatGoalValue, setFatGoalValue] = useState(0);
    const [carbGoalValue, setCarbGoalValue] = useState(0);
    const [proteinGoalValue, setProteinGoalValue] = useState(0);

    async function addMacrosPOST() {
        var intCal = parseInt(addCaloriesValue);
        var intCarbs = parseInt(addCarbsValue);
        var intFat = parseInt(addFatValue);
        var intProt = parseInt(addProteinValue);
        alert("adding macros");
        const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/addMacros", {
            method: 'POST',
            body: JSON.stringify({ "id": cookies.id, calories: intCal, fat: intFat, carbs: intCarbs, protein: intProt }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        document.getElementById('caloriesInput').value = '';
        document.getElementById('carbsInput').value = '';
        document.getElementById('fatInput').value = '';
        document.getElementById('proteinInput').value = '';
        var body = await result.json();
        return body;
    }

    async function changeMacroGoalsPOST() {
        var intCal = parseInt(calorieGoalValue);
        var intCarbs = parseInt(carbGoalValue);
        var intFat = parseInt(fatGoalValue);
        var intProt = parseInt(proteinGoalValue);
        const result = await fetch("https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/changeMacroGoals", {
            method: 'POST',
            body: JSON.stringify({ "id": cookies.id, calories: intCal, fat: intFat, carbs: intCarbs, protein: intProt }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        document.getElementById('carbGoalInput').value = '';
        document.getElementById('proteinGoalInput').value = '';
        document.getElementById('fatGoalInput').value = '';
        document.getElementById('caloriesGoalInput').value = '';
        var body = await result.json();
        return body;
    }
   

    useEffect(() => {
        const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getMacros?id=${cookies.id}`;
        fetch(URL)
            .then(response => response.json())
            .then(setData)

    }, []);

    if (data) {
        return (
            <div>
                <h1 class="display-1 text-center" style={{"margin-bottom" : "30px"}}>Macro Tracking</h1>        
                <h1>Track Daily Macros</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="caloriesInput">Calories</label>
                        <input type="number" className="form-control" id="caloriesInput" onChange={(event) => setAddCalories(event.target.value)} placeholder="Calories in your meal" />
                        <label htmlFor="fatInput">Fat</label>
                        <input type="number" className="form-control" id="fatInput" onChange={(event) => setAddFat(event.target.value)} placeholder="Fat (in grams)" />
                        <label htmlFor="carbsInput">Carbs</label>
                        <input type="number" className="form-control" id="carbsInput" onChange={(event) => setAddCarbs(event.target.value)} placeholder="Carbs (in grams)" />
                        <label htmlFor="proteinInput">Protein</label>
                        <input type="number" className="form-control" id="proteinInput" onChange={(event) => setAddProtein(event.target.value)} placeholder="Protein (in grams)" />
                    </div>
                    <button style ={{"margin-bottom" : "50px"}} class="btn btn-primary" onClick={() => addMacrosPOST()} type="button">Add Macros</button>
                </form>
                <form>
                 <h1>Change Macros goals</h1>
                    <div className="form-group">
                        <label htmlFor="caloriesGoalInput">Calorie Goals</label>
                        <input type="number" className="form-control" id="caloriesGoalInput" onChange={(event) => setCalorieGoalValue(event.target.value)} placeholder="Calories goal" />
                        <label htmlFor="fatGoalInput">Fat Goals</label>
                        <input type="number" className="form-control" id="fatGoalInput" onChange={(event) => setFatGoalValue(event.target.value)} placeholder="Fat goal (in grams)" />
                        <label htmlFor="carbsGoalInput">Carb Goal</label>
                        <input type="number" className="form-control" id="carbGoalInput" onChange={(event) => setCarbGoalValue(event.target.value)} placeholder="Carbs goal (in grams)" />
                        <label htmlFor="proteinGoalInput">Protein Goal</label>
                        <input type="number" className="form-control" id="proteinGoalInput" onChange={(event) => setProteinGoalValue(event.target.value)} placeholder="Protein goal (in grams)" />
                    </div>
                    <button class="btn btn-primary" onClick={() => changeMacroGoalsPOST()} type="button">Change macro goal</button>
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
