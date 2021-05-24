import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactHtmlParser from 'react-html-parser';
import ListGroup from 'react-bootstrap/ListGroup';


function RecipePage() {
    const [cookies, setCookie] = useCookies(['name']);
    const [recipeData, setRecipeData] = useState(null);
    const [ingridients, setIngridients] = useState([]);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const recipeId = urlParams.get("recipeId");



    useEffect(() => {
        const getRecipeURL = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=d41161c9f9e8416cb1f41f655ea69192`;
        fetch(getRecipeURL)
            .then(response => response.json())
            .then((recipe) => {
                if (recipe) {
                    var ingridientsArray = recipe.extendedIngredients;
                    var ingridientListItems = [];
                    for (var i = 0; i < ingridientsArray.length; i++) {
                        var ingridient = ingridientsArray[i];
                        if (ingridient.originalString) {
                            ingridientListItems.push(<ListGroup.Item>{ingridient.originalString}</ListGroup.Item>)
                        }
                    }
                    setIngridients(ingridientListItems);
                    setRecipeData(recipe);
                }
            })
    }, []);

    if (recipeData) {
        return (
            <div>
                <h1 style={{"margin-bottom" : "50px"}} class="display-1 text-center">{recipeData.title}</h1> 
                <h2 style={{"margin-bottom" : "20px"}}>Will be ready in {recipeData.readyInMinutes} and serve {recipeData.servings} people</h2>
                <div style={{"font-size" : "150%", "margin-bottom" : "20px"}}> {ReactHtmlParser(recipeData.summary)} </div>
                <h2 style={{"margin-bottom" : "20px"}}>Ingredients:</h2>
                <ListGroup style={{"margin-bottom" : "20px", "font-size" : "120%"}}>
                    {ingridients}
                </ListGroup>
                { recipeData.instructions &&
                    <div>
                        <h2 style={{"margin-bottom" : "20px"}}>Instructions:</h2>
                        <div style={{"font-size" : "150%"}}> {ReactHtmlParser(recipeData.instructions)} </div>
                    </div>
                }

            </div>
        )
    }
    else {
        return (
            <div>
                <h2>loading recipe</h2>
            </div>

        )
    }
}

export default RecipePage; 
