import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const LIMIT = 30;

export default class Records extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: props.records.items ? Math.floor(props.records.items.length / LIMIT) : -1,
      query: '',
    };
  }

  async componentDidMount() {
    if (! this.props.records.items) {
      this.fetchRecords();
    } else if (this.props.location.state?.reload) {
      this.search();
    }
  }

  async fetchRecords(page) {
    const newPage = page ?? (this.state.page + 1);
    const params = new URLSearchParams({
      page: newPage,
      limit: LIMIT,
      ...(this.state.query ? {q: this.state.query} : {}),
    });

    const res = await fetch('/api/records?' + params.toString());
    const {records, total} = await res.json();
    this.setState({
      page: newPage,
    });
    return this.props.setRecords({
      total,
      items: (this.props.records.items || []).concat(records)
    });
  }

  async search() {
    this.props.setRecords({ items: null, total: 0 });
    this.fetchRecords(0);
  }

  render() {
    const {items: records, total} = this.props.records;

    if (! records) {
      return <div>Loading...</div>;
    }

    return (
      <>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input
              className="input" type="text"
              placeholder="Filter by name, artist, style or label"
              value={this.state.query}
              onChange={(e) => this.setState({
                query: e.target.value,
              })}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  this.search();
                }
              }}
            />
          </div>
          <div className="control">
            <button className="button is-info" onClick={() => this.search()}>
              Search
            </button>
          </div>
        </div>
        <div className="mt-5">
          {records.map((record) => (
            <Link to={`/record/${record._id}`} key={record._id} className="media" style={{color: 'unset'}}>
              <figure className="media-left" style={{ width: '72px' }}>
                <p className="image is-square">
                  <img src={record.coverImg} alt={record.title} />
                </p>
              </figure>
              <div className="media-content">
                <p><strong>{record.title}</strong></p>
                <p>{record.artists.join(', ')}</p>
                <p><small>{record.label} {record.year}</small></p>
              </div>
            </Link>
          ))}
        </div>
        {total && total > records.length ? (
          <div className="is-flex is-justify-content-center mt-5">
            <button
              className="button is-dark"
              onClick={() => this.fetchRecords()}
            >
              Load More
            </button>
          </div>
        ) : null}
        {total ? (
          <div className="is-flex is-justify-content-center mt-5">
            <span className="">
              Displaying <strong>{records.length}</strong> of total <strong>{total}</strong> results
            </span>
          </div>
        ) : null}
      </>
    )
  }
}
