import {Router} from 'express';

import TrackModel from '../../db/models/Track';

const router = Router();

const parseBpm = (str: any): Array<number> | undefined => {
  if (!str || !Array.isArray(str)) {
    return undefined;
  }
  return str.map(s => +s);
}

router.get('/tracks', async (req, res) => {
  const {limit, page, q, bpm, extendedBpm} = req.query;

  const result = await TrackModel
    .query({
      q: q ? String(q) : undefined,
      bpm: parseBpm(bpm),
      limit: limit ? +limit : undefined,
      page: page ? +page : undefined,
      extendedBpm: Boolean(extendedBpm),
    });

  return res.json(result);
});

export default router;
