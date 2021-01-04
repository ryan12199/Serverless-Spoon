import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";


function Macros() {
    const [cookies, setCookie] = useCookies(['name']);
    const [data, setData] = useState(null);
    const URL = `https://qt6uy2yofd.execute-api.us-east-1.amazonaws.com/Prod/getMacros?id=${cookies.id}`;
    console.log(URL);
    useEffect(() => {
        fetch(URL)
            .then(response => response.json())
            .then(setData)

    }, []);

    if (data) {
        return (<div>
            <h2>Macros Page</h2>
            <h1>Hello {cookies.id}!</h1>
            <h1>{JSON.stringify(data)}</h1>
        </div>)
    }
    else{
        return (<div>
            <h2>Macros Page</h2>
            <h1>Hello {cookies.id}!</h1>
            <h2>No data available</h2>
        </div>)
    }
}

export default Macros; 
