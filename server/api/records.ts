import {Router} from 'express';

import DiscRecordModel from '../db/models/DiscRecord';
import TrackModel from '../db/models/Track';

const router = Router();

router.get('/records', async (req, res) => {
  const {limit=20, page=0} = req.query;

  const records = await DiscRecordModel
    .find()
    .skip(+limit * +page)
    .limit(limit);

  return res.json(records);
});

router.get('/record/:recordID', async (req, res) => {
  const {recordID} = req.params;

  const record = await DiscRecordModel
    .populateTracks(recordID);

  return res.json(record);
});

router.post('/record', async (req, res) => {
  const {tracks, ...body} = req.body;

  const created = await DiscRecordModel
    .create(body);

  await TrackModel
    .upsertTracks(created._id, tracks);

  const record = await DiscRecordModel
    .populateTracks(created._id);

  return res.json(record);
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
