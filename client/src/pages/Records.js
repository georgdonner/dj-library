import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const LIMIT = 20;

export default class Records extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: props.records ? Math.floor(props.records.length / LIMIT) : -1,
      total: 0,
    };
  }

  async componentDidMount() {
    if (! this.props.records) {
      this.fetchRecords();
    }
  }

  async fetchRecords() {
    const params = new URLSearchParams({
      page: this.state.page + 1,
      limit: LIMIT,
    });

    const res = await fetch('/api/records?' + params.toString());
    const {records, total} = await res.json();
    this.setState({
      page: this.state.page + 1,
      total,
    });
    return this.props.setRecords((this.props.records || []).concat(records));
  }

  render() {
    if (! this.props.records) {
      return <div>Lädt...</div>;
    }

    return (
      <div id="records" className="container mt-5">
        {this.props.records.map((record) => (
          <Link to={`/record/${record._id}`} key={record._id} className="media" style={{color: 'unset'}}>
            <figure className="media-left">
              <p className="image is-96x96">
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
        {this.state.total && this.state.total > this.props.records.length ? (
          <div className="is-justify-content-center">
            <button
              className="button is-dark"
              onClick={() => this.fetchRecords()}
            >
              Load More
            </button>
          </div>
        ) : null}
      </div>
    )
  }
}
