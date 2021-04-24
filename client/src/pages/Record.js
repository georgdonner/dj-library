import React, { useEffect, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';

const formatSeconds = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? `0${s}` : s}`;
}

export default () => {
  const { id } = useParams();
  const history = useHistory();

  const [record, setRecord] = useState();
  const [spotifyURI, setSpotifyURI] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(async () => {
    const res = await fetch(`/api/record/${id}`);
    const _record = await res.json();
    setRecord(_record);
  }, [id]);

  if (! record) {
    return <div>Loading...</div>;
  }

  const invalidInput = spotifyURI
    ? ! spotifyURI.match(/^spotify:album:.*$/i)
    : false;

  const addBpm = async () => {
    setLoading(true);
    const albumID = spotifyURI.split(':').pop();
    const res = await fetch(`/api/record/${id}/bpm`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ albumID }),
    });
    const updated = await res.json();
    setSpotifyURI('');
    setRecord(updated);
    setLoading(false);
  }

  const deleteRecord = async () => {
    if (window.confirm(`Really delete record ${record.title}?`)) {
      await fetch(`/api/record/${id}`, {
        method: 'DELETE',
      });
      history.replace('/', { reload: true });
    }
  }

  return (
    <>
      <article className="media">
        <figure className="media-left" style={{ width: '180px' }}>
          <p className="image is-square">
            <img src={record.coverImg} />
          </p>
        </figure>
        <div className="media-content">
          <h1 className="title is-4">{record.title}</h1>
          <h2 className="subtitle is-5">{record.artists.join(', ')}</h2>

          <p><strong>Label:</strong> {record.label}</p>
          {record.format ? <p><strong>Format:</strong> {record.format}</p> : null}
          {record.discSize ? <p><strong>Disc Size:</strong> {record.discSize} in.</p> : null}
          {record.tempo ? <p><strong>Tempo:</strong> {record.tempo} rpm</p> : null}
          <p><strong>Year:</strong> {record.year}</p>
          <p><strong>Styles:</strong> {record.styles.join(', ')}</p>
        </div>
      </article>

      <table className="table mt-5 is-fullwidth" style={{ maxWidth: '750px' }}>
        <thead>
          <tr>
            <th style={{ width: '1rem' }}>Side</th>
            <th>Title</th>
            <th style={{ width: '4rem' }}>BPM</th>
            <th style={{ width: '4rem' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          {record.tracks.map((track) => (
            <tr key={track._id}>
              <td>{String.fromCharCode(65 + track.side)}</td>
              <td>{track.title}</td>
              <td className="has-text-centered">{track.bpm}</td>
              <td className="has-text-right">{formatSeconds(track.duration)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {record.notes ? (
        <div className="content" style={{ whiteSpace: 'pre-wrap' }}>
          <h3>Notes</h3>
          <p className="mb-5">{record.notes}</p>
        </div>
      ) : null}

      <span className="icon-text is-clickable mb-4" onClick={() => setShowAdvanced(! showAdvanced)}>
        <span className="icon">
          <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
        </span>
        <span>Advanced</span>
      </span>
      {showAdvanced ? (
        <div className="is-flex is-justify-content-space-between">
          <div>
            <Link
              to={{
                pathname: "/edit-record",
                state: record,
              }}
              className="button is-dark mr-3"
            >
              Edit
            </Link>
            <button className="button is-danger" onClick={deleteRecord}>
              Delete
            </button>
          </div>
          <div className="field">
            <div className="field has-addons mb-0">
              <div className="control">
                <input
                  type="text" placeholder="Spotify URI"
                  className={`input ${invalidInput ? 'is-danger' : 'is-success'}`}
                  value={spotifyURI}
                  onChange={(e) => setSpotifyURI(e.target.value)}
                />
              </div>
              <div className="control">
                <button
                  className={`button is-success${loading ? ' is-loading' : ''}`}
                  disabled={! spotifyURI || invalidInput}
                  onClick={addBpm}
                >
                  Add BPM
                </button>
              </div>
            </div>
            {invalidInput ? <p class="help is-danger">Invalid Spotify URI</p> : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
