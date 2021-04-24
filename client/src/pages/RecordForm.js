import React, { Component } from 'react';

export default class RecordForm extends Component {
  constructor(props) {
    super(props);
    const record = props.location.state;
    this.state = {
      ...record,
      artists: record.artists.join(';'),
      styles: record.styles.join(';'),
    };
  }

  inputChange(e, prop, isNumber = false) {
    this.setState({
      [prop]: isNumber ? +e.target.value : e.target.value,
    });
  }

  trackChange(e, prop, trackID, isNumber = false) {
    const tracks = this.state.tracks
      .map((track) => {
        if (track._id !== trackID) {
          return track;
        }
        return {
          ...track,
          [prop]: isNumber ? +e.target.value : e.target.value,
        }
      });
    this.setState({
      tracks,
    });
  }

  async save() {
    const updated = {
      ...this.state,
      artists: this.state.artists.split(';'),
      styles: this.state.styles.split(';'),
    };

    await fetch(`/api/record/${this.state._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updated),
    });

    this.props.history.replace(`/record/${this.state._id}`);
  }

  render() {
    return (
      <>
        <div className="field">
          <label className="label">Name</label>
          <input
            type="text" className="input" placeholder="Record name"
            value={this.state.title}
            onChange={(e) => this.inputChange(e, 'title')}
          />
        </div>
        <div className="field">
          <label className="label">Artists</label>
          <input
            type="text" className="input" placeholder="Record artists"
            value={this.state.artists}
            onChange={(e) => this.inputChange(e, 'artists')}
          />
          <p className="help">Separate multiple artists with a ";"</p>
        </div>
        <div className="field">
          <label className="label">Styles</label>
          <input
            type="text" className="input" placeholder="e.g. Funk, House"
            value={this.state.styles}
            onChange={(e) => this.inputChange(e, 'styles')}
          />
          <p className="help">Separate multiple styles with a ";"</p>
        </div>
        <div className="field is-grouped">
          <div className="field mr-4">
            <label className="label">Label</label>
            <input
              type="text" className="input" placeholder="Record label"
              value={this.state.label}
              onChange={(e) => this.inputChange(e, 'label')}
            />
          </div>
          <div className="field">
            <label className="label">Year</label>
            <input
              type="number" className="input" placeholder="Record release year"
              value={this.state.year}
              onChange={(e) => this.inputChange(e, 'year', true)}
            />
          </div>
        </div>
        <label className="label">Disc details</label>
        <div className="field is-grouped">
          <div className="control">
            <div className="select">
              <select
                value={this.state.format}
                onChange={(e) => this.inputChange(e, 'format')}
              >
                <option value="">Select format</option>
                <option value="LP">LP</option>
                <option value="EP">EP</option>
                <option value="Single">Single</option>
              </select>
            </div>
          </div>
          <div className="control">
            <div className="select">
            <select
                value={this.state.discSize}
                onChange={(e) => this.inputChange(e, 'discSize', true)}
              >
                <option value="">Select disc size</option>
                <option value="7">7 in.</option>
                <option value="10">10 in.</option>
                <option value="12">12 in.</option>
              </select>
            </div>
          </div>
          <div className="control">
            <div className="select">
              <select
                value={this.state.tempo}
                onChange={(e) => this.inputChange(e, 'tempo', true)}
              >
                <option value="">Select tempo</option>
                <option value="33">33 RPM</option>
                <option value="45">45 RPM</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Cover image</label>
          <input
            type="text" className="input" placeholder="Record cover img"
            value={this.state.coverImg}
            onChange={(e) => this.inputChange(e, 'coverImg')}
          />
        </div>
        <label className="label">Tracks</label>
        <table className="table is-fullwidth" style={{ maxWidth: '750px' }}>
          <thead>
            <tr>
              <th style={{ width: '2rem' }}>Side</th>
              <th>Title</th>
              <th style={{ width: '6rem' }}>BPM</th>
              <th style={{ width: '6rem' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {this.state.tracks.map((track) => (
              <tr key={track._id}>
                <td>
                  <div className="select">
                    <select
                      value={track.side}
                      onChange={(e) => this.trackChange(e, 'side', track._id, true)}
                    >
                      <option value="0">A</option>
                      <option value="1">B</option>
                      <option value="2">C</option>
                      <option value="3">D</option>
                      <option value="4">E</option>
                      <option value="5">F</option>
                    </select>
                  </div>
                </td>
                <td>
                  <input
                    type="text" className="input" placeholder="Track name"
                    value={track.title}
                    onChange={(e) => this.trackChange(e, 'title', track._id)}
                  />
                </td>
                <td>
                  <input
                    type="number" className="input" placeholder="BPM"
                    value={track.bpm}
                    onChange={(e) => this.trackChange(e, 'bpm', track._id, true)}
                  />
                </td>
                <td>
                  <input
                    type="number" className="input" placeholder="Duration in seconds"
                    value={track.duration}
                    onChange={(e) => this.trackChange(e, 'duration', track._id, true)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="field">
          <label className="label">Notes</label>
          <textarea
            type="text" className="textarea" placeholder="Notes"
            value={this.state.notes}
            onChange={(e) => this.inputChange(e, 'notes')}
          />
        </div>
        <button className="button is-dark" onClick={() => this.save()}>Save</button>
      </>
    );
  }
}
