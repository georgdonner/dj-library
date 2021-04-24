import React, { useEffect, useState } from 'React';
import { Link, useParams } from 'react-router-dom';

const formatSeconds = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? `0${s}` : s}`;
}

export default () => {
  const { id } = useParams();
  const [record, setRecord] = useState();

  useEffect(async () => {
    const res = await fetch(`/api/record/${id}`);
    const _record = await res.json();
    setRecord(_record);
  }, [id]);

  if (! record) {
    return <div>Loading...</div>;
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
        <p>{record.notes}</p>
      ) : null}

      <Link
        to={{
          pathname: "/edit-record",
          state: record,
        }}
        className="button"
      >
        Edit
      </Link>
    </>
  )
}
