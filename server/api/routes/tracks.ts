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
  const {limit, page, q, style, bpm} = req.query;

  const tracks = await TrackModel
    .query({
      q: q ? String(q) : undefined,
      style: style ? String(style) : undefined,
      bpm: parseBpm(bpm),
      limit: limit ? +limit : undefined,
      page: page ? +page : undefined,
    });

  return res.json(tracks);
});

export default router;