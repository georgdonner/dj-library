import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

const LIMIT = 20;
const DEFAULT_BPM = [0, 250];

const formatSeconds = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? `0${s}` : s}`;
}

const isDefaultBpm = (bpm) => {
  return JSON.stringify(bpm) === JSON.stringify(DEFAULT_BPM);
}

export default class Tracks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: props.tracks ? Math.floor(props.tracks.length / LIMIT) : -1,
      total: 0,
      query: '',
      bpm: DEFAULT_BPM,
      extendedBpm: false,
    };
  }

  async componentDidMount() {
    if (! this.props.tracks) {
      this.fetchTracks();
    }
  }

  async fetchTracks(page) {
    const newPage = page ?? (this.state.page + 1);
    const params = new URLSearchParams({
      page: newPage,
      limit: LIMIT,
      ...(this.state.query ? {q: this.state.query} : {}),
    });
    if (this.state.bpm && ! isDefaultBpm(this.state.bpm)) {
      this.state.bpm.forEach(n => params.append('bpm', n));
      if (this.state.extendedBpm) {
        params.append('extendedBpm', 'y');
      }
    }

    const res = await fetch('/api/tracks?' + params.toString());
    const {tracks, total} = await res.json();
    this.setState({
      page: newPage,
      total,
    });
    return this.props.setTracks((this.props.tracks || []).concat(tracks));
  }

  async search() {
    this.props.setTracks(null);
    this.fetchTracks(0);
  }

  render() {
    if (! this.props.tracks) {
      return <div>Loading...</div>;
    }

    return (
      <>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input
              className="input" type="text"
              placeholder="Filter by track name, record name, artist, style or label"
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
        <div className="is-flex is-align-items-center pr-1">
          <strong className="mr-5">BPM</strong>
          <Range
            min={0} max={250}
            value={this.state.bpm}
            onChange={(bpm) => this.setState({ bpm })}
            marks={this.state.bpm.reduce((a,v) => ({...a, [v]: v}), {})}
          />
          <span className="ml-5 is-clickable" onClick={() => this.setState({ bpm: DEFAULT_BPM })}>Reset</span>
        </div>
        <div className="mt-5 mb-6">
          <label className="checkbox">
            <input
              className="mr-2" type="checkbox" checked={this.state.extendedBpm}
              onChange={(e) => this.setState({ extendedBpm: e.target.checked })}
            />
            Include half/double BPM
          </label>
        </div>
        <div className="mt-5">
          {this.props.tracks.map((track) => (
            <Link to={`/record/${track.record._id}`} key={track._id} className="media" style={{color: 'unset'}}>
              <figure className="media-left" style={{ width: '72px' }}>
                <p className="image is-square">
                  <img src={track.record.coverImg} alt={track.record.title} />
                </p>
              </figure>
              <div className="media-content">
                <p><strong>{track.title}</strong></p>
                <div className="is-flex is-justify-content-space-between">
                  <span>{track.record.title}</span>
                  {track.duration ? <span>{formatSeconds(track.duration)}</span> : null}
                </div>
                <div className="is-flex is-justify-content-space-between">
                  <span>{track.record.artists.join(', ')}</span>
                  {track.bpm ? <span>{track.bpm} BPM</span> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {this.state.total && this.state.total > this.props.tracks.length ? (
          <div className="is-justify-content-center mt-5">
            <button
              className="button is-dark"
              onClick={() => this.fetchTracks()}
            >
              Load More
            </button>
          </div>
        ) : null}
      </>
    )
  }
}
