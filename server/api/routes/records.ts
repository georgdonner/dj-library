import {Router} from 'express';
import config from '../../config';

import DiscRecordModel, { DiscRecordWithTracks } from '../../db/models/DiscRecord';
import TrackModel, { TrackDocument } from '../../db/models/Track';
import Discogs from '../modules/discogs';
import Spotify from '../modules/spotify';

const router = Router();

router.get('/records', async (req, res) => {
  const {limit, page, q} = req.query;

  const result = await DiscRecordModel
    .query({
      q: q ? String(q) : undefined,
      limit: limit ? +limit : undefined,
      page: page ? +page : undefined,
    });

  return res.json(result);
});

router.get('/record/:recordID', async (req, res) => {
  const {recordID} = req.params;

  const record = await DiscRecordModel
    .populateTracks(recordID);

  return res.json(record);
});

const createRecord = async (body: any): Promise<DiscRecordWithTracks> => {
  const {tracks, ...record} = body;

  const created = await DiscRecordModel
    .create(record);

  await TrackModel
    .upsertTracks(created._id, tracks);

  return DiscRecordModel
    .populateTracks(created._id);
}

router.post('/record', async (req, res) => {
  const record = await createRecord(req.body);

  return res.json(record);
});

router.post('/record/discogs', async (req, res) => {
  const {releaseUrl} = req.body;

  if (! releaseUrl) {
    throw new Error('Please provide a release URL');
  }

  const discogs = new Discogs(config.discogs.token);

  const record = await discogs
    .fetchRecord(releaseUrl);

  const recordDoc = await createRecord(record);

  return res.json(recordDoc);
});

router.put('/record/:recordID', async (req, res) => {
  const {recordID} = req.params;
  const {_id, tracks, ...record} = req.body;

  await TrackModel
    .upsertTracks(recordID, tracks);

  await DiscRecordModel
    .findByIdAndUpdate(recordID, record);

  const updated = await DiscRecordModel
    .populateTracks(recordID);

  return res.json(updated);
});

router.put('/record/:recordID/bpm', async (req, res) => {
  const {recordID} = req.params;
  const {albumID} = req.body;

  const tracks: TrackDocument[] = await TrackModel
    .find({
      record: recordID,
    });

  const spotify = new Spotify();
  await spotify.init();
  const populated = await spotify.populateBpm(tracks, albumID);

  await TrackModel
    .upsertTracks(recordID, populated);

  const updated = await DiscRecordModel
    .populateTracks(recordID);

  return res.json(updated);
});

router.delete('/record/:recordID', async (req, res) => {
  const {recordID} = req.params;

  await TrackModel
    .deleteMany({
      record: recordID,
    });

  await DiscRecordModel
    .findByIdAndDelete(recordID);

  return res.sendStatus(200);
});

export default router;
