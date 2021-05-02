import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect, useRef } from "react";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useRouteMatch } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
require('bootstrap');


function Home() {
  const [cookies, setCookie] = useCookies(['name']);
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [macroValues, setMacroValues] = useState({ "calories": 0, "fat": 0, "carbs": 0, "protein": 0 });
  const [macroPercentages, setMacroPercentages] = useState({ "calories": 0, "fat": 0, "carbs": 0, "protein": 0 });
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  console.log("everything running")

  // TODO: cookie argument not working


  async function fetchUserData(userIdArg = null) {


    console.log("fetch running")
    //only get called when cookies.id is defined 
    console.log("cookie id")
    console.log(cookies.id)
    console.log("user id")
    console.log(userId)
    var id;
    if(!userIdArg){
      id = userId;
    }
    else{
      id = userIdArg;
    }
    
    if (cookies.id) {
      id = cookies.id;
    }
    const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getUser?id=${id}`;
    const result = await fetch(URL, {
      method: 'get',
    });
    const body = await result.json();
    if (body["user"]) {
      var macroGoals = body["user"]["macroGoals"];
      var macroValuesJSON = body["user"]["macros"];
      var caloriesPercentage = macroValuesJSON.calories / macroGoals.calories * 100;
      var fatPercentage = macroValuesJSON.fat / macroGoals.fat * 100;
      var carbsPercentage = macroValuesJSON.carbs / macroGoals.carbs * 100;
      var proteinPercentage = macroValuesJSON.protein / macroGoals.fat * 100;

      var macroPerObj = { "calories": caloriesPercentage, "fat": fatPercentage, "carbs": carbsPercentage, "protein": proteinPercentage };
      setMacroPercentages(macroPerObj);
      setMacroValues(macroValuesJSON);
      console.log(macroPerObj);
    }
    setUserData(body["user"]);
  }

  useEffect(() => {
    console.log("use effect running")
    if (cookies.id) {
      fetchUserData();
    }
  }, []);

  async function searchUser() {
    setCookie("id", userId, {});
    console.log("search cookie")
    console.log(cookies.id)
    fetchUserData();
  }

  if (cookies.id || userData) {
    return (
      <div class="container">
        <div class="row justify-content-center">
          <div class="col">
            <h3 class="text-center">Calories:</h3>
            <CircularProgressbar value={macroPercentages.calories} text={`${macroValues.calories} cals`} strokeWidth={5} />
          </div>
          <div class="col">
            <h3 class="text-center">Fat:</h3>
            <CircularProgressbar value={macroPercentages.fat} text={`${macroValues.fat} g`} strokeWidth={5} />
          </div>
          <div class="col">
            <h3 class="text-center">Carbs:</h3>
            <CircularProgressbar value={macroPercentages.carbs} text={`${macroValues.carbs} g`} strokeWidth={5} />
          </div>
          <div class="col">
            <h3 class="text-center">Protein:</h3>
            <CircularProgressbar value={macroPercentages.protein} text={`${macroValues.protein} g`} strokeWidth={5} />
          </div>
        </div>
      </div>
    )
  }
  /*
   {userData &&
        <h2>
          {JSON.stringify(userData)}
        </h2>
      }
  */
  const responseGoogle = (response) => {
    console.log("response running")
    console.log(response.googleId);
    setUserId(response.googleId)
    console.log("response userId")
    console.log(userId)

    fetchUserData(response.googleId)
    forceUpdate()
  }

  return (
    <div>
      <button onClick={() => searchUser()}>Create user</button>
      <label>
        ID:
      <input type="ID" onChange={(event) => setUserId(event.target.value)} />
      </label>
      <GoogleLogin
        clientId="237051192708-qq3mafbbs63acrk8qu0sf09v6omucs30.apps.googleusercontent.com"
        buttonText="Login"
        // isSignedIn={true}
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />

    </div>
  );
}

export default Home;