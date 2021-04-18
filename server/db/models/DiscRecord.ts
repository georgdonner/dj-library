import { Document, Model, Schema, Types, model } from 'mongoose';
import TrackModel, { TrackWithoutRecord, Track } from './Track';

const formats = [
  'LP',
  'EP',
  'Single',
];

const schema = new Schema<DiscRecordDocument, DiscRecordModel>({
  title: {
    type: String,
    required: true,
  },
  artists: {
    type: [String],
    required: true,
  },
  label: String,
  year: Number,
  coverImg: String,
  format: {
    type: String,
    enum: formats,
  },
  discSize: Number,
  tempo: Number,
  styles: [String],
  notes: String,
}, {
  versionKey: false,
  strict: true,
});

export interface DiscRecord {
  title: string;
  artists: Array<string>;
  label?: string;
  year?: number;
  coverImg?: string;
  format?: string;
  discSize?: number;
  tempo?: number;
  styles?: Array<string>;
  notes?: string;
};

export interface DiscRecordWithTracks extends DiscRecord {
  tracks: Array<TrackWithoutRecord>;
}

export interface DiscRecordDocument extends DiscRecord, Document {
  artists: Types.Array<string>;
  styles: Types.Array<string>;
};

type QueryOptions = {
  q?: string;
  page?: number;
  limit?: number;
}

export interface DiscRecordModel extends Model<DiscRecordDocument> {
  populateTracks(id: string): Promise<DiscRecordWithTracks>;
  query(options: QueryOptions): Promise<Array<DiscRecord>>;
  formats(): Array<string>;
};

schema.statics.populateTracks = async function(
  this: Model<DiscRecordDocument>,
  id: Types.ObjectId | string
): Promise<DiscRecordWithTracks> {
  
  const tracks: Array<Track> = await TrackModel
    .find({ record: id })
    .lean();

  const record: DiscRecord = await this
    .findById(id)
    .lean();
    
  const populated: DiscRecordWithTracks = {
    ...record,
    tracks: tracks.map(({record, ...track}) => track),
  };

  return populated;
}

schema.statics.query = async function(
  this: Model<DiscRecordDocument>,
  options: QueryOptions,
): Promise<Array<DiscRecord>> {

  const {
    q, page=0, limit=20,
  } = options;
  const pipeline = [];
  
  if (q) {
    const escaped = q.replace(/[-[\]{}()/*+?.\\^$|]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    pipeline.push(...[
      {$lookup: {
        from: TrackModel.collection.name,
        localField: '_id',
        foreignField: 'record',
        as: 'tracks',
      }},
      {$match: {
        $or: [
          {artists: regex},
          {styles: regex},
          {title: regex},
          {label: regex},
          {'tracks.title': regex},
        ]
      }},
      {$project: {
        tracks: 0,
      }}
    ]);
  }

  const records: Array<DiscRecord> = await this
    .aggregate([
      ...pipeline,
      {$skip: limit * page},
      {$limit: limit},
    ]);

  return records;
}

schema.statics.formats = () => formats;

export default model<DiscRecordDocument, DiscRecordModel>('discrecord', schema);
