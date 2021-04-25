import { Document, Model, Schema, Types, model } from 'mongoose';
import DiscRecordModel, { DiscRecordDocument } from './DiscRecord';

const schema = new Schema<TrackDocument, TrackModel>({
  title: {
    type: String,
    required: true,
  },
  record: {
    type: Schema.Types.ObjectId,
    ref: 'DiscRecord',
    required: true
  },
  duration: Number,
  side: {
    required: true,
    type: Number,
    default: 0,
  },
  bpm: Number,
}, {
  versionKey: false,
  strict: true,
});

export interface TrackWithoutRecord {
  title: string;
  duration?: number;
  side: number;
  bpm?: number;
};

export interface Track extends TrackWithoutRecord {
  record: Types.ObjectId | Record<string, unknown>;
};

export interface TrackBaseDocument extends Track, Document {};

export interface TrackDocument extends TrackBaseDocument {
  record: DiscRecordDocument['_id'];
}

export interface TrackModel extends Model<TrackDocument> {
  upsertTracks(recordID: string, tracks: Array<TrackDocument>): Promise<void>;
  query(options: QueryOptions): Promise<QueryResult>;
};

schema.statics.upsertTracks = async function(
  this: Model<TrackDocument>,
  recordID: Types.ObjectId | string,
  tracks: Array<TrackDocument> = []
): Promise<void> {

  const currentTracks: Array<TrackDocument> = await this
    .find({ record: recordID })
    .lean();

  const currentTrackIDs = currentTracks
    .map(track => String(track._id));

  const upsertTrackIDs = tracks
    .filter(track => track._id)
    .map(track => String(track._id));

  const inserts = [];
  const updates = [];
  const deletes = currentTrackIDs
    .filter(trackID => ! upsertTrackIDs.includes(trackID));

  for (const track of tracks) {
    if (! track._id) {
      inserts.push({
        ...track,
        record: recordID,
      });
    }
    else {
      const { record, ...update } = 'toObject' in track ? track.toObject() : track;
      updates.push(update);
    }
  }

  if (inserts.length) {
    await this.insertMany(inserts);
  }
  if (updates.length) {
    await Promise.all(updates.map(update => this.findByIdAndUpdate(update._id, update)));
  }
  if (deletes.length) {
    await this.deleteMany({
      _id: { $in: deletes },
    });
  }
}

type QueryOptions = {
  q?: string;
  bpm?: Array<number>;
  page?: number;
  limit?: number;
}

type QueryResult = {
  tracks: Array<TrackDocument>;
  total: number;
}

schema.statics.query = async function(
  this: Model<TrackDocument>,
  options: QueryOptions,
): Promise<QueryResult> {

  const {
    q='', bpm, page=0, limit=20,
  } = options;

  const pipeline: Array<any> = [
    {$lookup: {
      from: DiscRecordModel.collection.name,
      localField: 'record',
      foreignField: '_id',
      as: 'record',
    }},
    {$unwind: '$record'},
  ];
  
  if (q || bpm?.length) {
    const $match: any = {};
    
    const terms = q.split(';');
    const regexTerms = terms.map((term) => {
      const escaped = term
        .trim()
        .replace(/[-[\]{}()/*+?.\\^$|]/g, '\\$&');
      return new RegExp(escaped, 'i');
    });

    if (regexTerms.length) {
      $match.$and = regexTerms.map(regex => ({
        $or: [
          {title: regex},
          {'record.artists': regex},
          {'record.title': regex},
          {'record.label': regex},
          {'record.styles': regex},
        ],
      }));
    }
    if (bpm?.length === 2) {
      bpm.sort((a,b) => a - b);
      $match.$and = ($match.$and || []).concat([
        {bpm: {$gte: bpm[0]}},
        {bpm: {$lte: bpm[1]}},
      ]);
    }

    pipeline.push({ $match });
  }

  const [{ tracks, total }] = await this
    .aggregate([
      ...pipeline,
      {$sort: {
        'record.artists': 1,
      }},
      {$facet: {
        total: [{ $count: 'count' }],
        tracks: [
          {$skip: limit * page},
          {$limit: limit},
        ],
      }},
    ]);

  return {
    tracks,
    total: total?.length ? total[0].count : 0,
  };
}

export default model<TrackDocument, TrackModel>('track', schema);
