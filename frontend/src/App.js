import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Recipes from './Recipes';
import Macros from './Macros';
import Inventory  from './Inventory';
import RecipePage  from './RecipePage';
import { NoMatch } from './NoMatch';
import { Layout } from './components/Layout';
import { NavigationBar } from './components/NavigationBar';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <NavigationBar />
          <Layout>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/macros" component={Macros} />
              <Route path="/recipePage" component={RecipePage} />
              <Route path="/recipes" component={Recipes} />
              <Route component={NoMatch} />
            </Switch>
          </Layout>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;
