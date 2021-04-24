import React, { useState } from 'react';

export default ({ setRecords }) => {
  const [releaseURL, setReleaseURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState();

  const invalidInput = releaseURL
    ? ! releaseURL.match(/^https:\/\/www\.discogs\.com\/[^\/]*\/[^\/]*\/release\/[^\/]*$/i)
    : false;

  const importRecord = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/record/discogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ releaseUrl: releaseURL }),
      });
      const inserted = await res.json();
      if (! inserted) {
        throw new Error('Import failed');
      }
      setRecords(null); // reset currently displayed records list
      setNotification({
        type: 'success',
        message: `${inserted.title} successfully imported with ${inserted.tracks.length} tracks`,
      });
    } catch (error) {
      setNotification({
        type: 'danger',
        message: `Import failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = ['input'];
  if (releaseURL) {
    inputClasses.push(invalidInput ? 'is-danger' : 'is-success');
  }

  return (
    <>
      <div className="field">
        <div className="field has-addons mb-0">
          <div className="control is-expanded">
            <input
              type="text" placeholder="Discogs Release URL"
              className={inputClasses.join(' ')}
              value={releaseURL}
              onChange={(e) => setReleaseURL(e.target.value)}
            />
          </div>
          <div className="control">
            <button
              className={`button is-success${loading ? ' is-loading' : ''}`}
              disabled={! releaseURL || invalidInput}
              onClick={importRecord}
            >
              Import Record
            </button>
          </div>
        </div>
        {invalidInput ? <p className="help is-danger">Invalid Discogs Release URL</p> : null}
      </div>
      {notification ? (
        <div className={`notification is-${notification.type}`}>
          <button className="delete" onClick={() => setNotification(null)}></button>
          {notification.message}
        </div>
      ) : null}
    </>
  );
}
