import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link, NavLink } from 'react-router-dom';

import Import from './pages/Import';
import Record from './pages/Record';
import RecordForm from './pages/RecordForm';
import Records from './pages/Records';
import Tracks from './pages/Tracks';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      records: {
        total: 0,
        items: null,
      },
      tracks: {
        total: 0,
        items: null,
      },
    };
  }

  render() {
    return (
      <Router>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-menu">
              <div className="navbar-start">
                <NavLink
                  to="/" activeClassName="is-active"
                  className="navbar-item is-tab"
                  isActive={(match, location) => {
                    if (location.pathname.startsWith('/record') || location.pathname === '/import') {
                      return true;
                    }
                    return match.isExact;
                  }}
                >
                  Records
                </NavLink>
                <NavLink to="/tracks" activeClassName="is-active" className="navbar-item is-tab">Tracks</NavLink>
              </div>
              <div className="navbar-end">
                <div className="navbar-item pr-0">
                  <div className="field is-grouped">
                    <p className="control">
                      <Link to="/import" className="button">
                        <span className="icon">
                          <i className="fas fa-plus" aria-hidden="true"></i>
                        </span>
                        <span>Import Record</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
    
          <div className="my-5" style={{ maxWidth: '750px', margin: '0 auto' }}>
            <Switch>
              <Route path="/import">
                <Import resetRecords={() => this.setState({ records: { items: null, total: 0 } })} />
              </Route>
              <Route path="/edit-record" component={RecordForm} />
              <Route path="/record/:id" component={Record} />
              <Route path="/tracks">
                <Tracks
                  tracks={this.state.tracks}
                  setTracks={(tracks) => this.setState({ tracks })}
                />
              </Route>
              <Route path="/" render={(props) => (
                <Records
                  records={this.state.records}
                  setRecords={(records) => this.setState({ records })}
                  {...props}
                />
              )} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

const root = document.getElementById('root');

ReactDOM.render(<App />, root);

