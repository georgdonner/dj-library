import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom';

import Record from './pages/Record';
import Records from './pages/Records';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      records: null,
      tracks: null,
    };
  }

  render() {
    return (
      <Router>
        <div className="container">
          <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-menu">
              <div className="navbar-start">
                <NavLink to="/" exact activeClassName="is-active" className="navbar-item is-tab">Records</NavLink>
                <NavLink to="/tracks" activeClassName="is-active" className="navbar-item is-tab">Tracks</NavLink>
              </div>
            </div>
          </nav>
    
          <div className="container my-5">
            <Switch>
              <Route path="/record/:id" component={Record} />
              <Route path="/">
                <Records
                  records={this.state.records}
                  setRecords={(records) => this.setState({ records })}
                />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

const root = document.getElementById('root');

ReactDOM.render(<App />, root);

