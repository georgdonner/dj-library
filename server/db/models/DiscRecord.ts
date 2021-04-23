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

export interface DiscRecordModel extends Model<DiscRecordDocument> {
  populateTracks(id: string): Promise<DiscRecordWithTracks>;
  query(options: QueryOptions): Promise<QueryResult>;
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

type QueryOptions = {
  q?: string;
  page?: number;
  limit?: number;
}

type QueryResult = {
  records: Array<DiscRecord>;
  total: number;
}

schema.statics.query = async function(
  this: Model<DiscRecordDocument>,
  options: QueryOptions,
): Promise<QueryResult> {

  const {
    q='', page=0, limit=20,
  } = options;
  const match: any = {};
  
  if (q) {
    const terms = q.split(';');
    const regexTerms = terms.map((term) => {
      const escaped = term
        .trim()
        .replace(/[-[\]{}()/*+?.\\^$|]/g, '\\$&');
      return new RegExp(escaped, 'i');
    });

    if (regexTerms.length) {
      match.$and = regexTerms.map(regex => ({
        $or: [
          {artists: regex},
          {title: regex},
          {label: regex},
          {styles: regex},
        ],
      }));
    }
  }

  const [records, total] = await Promise.all([
    this.find(match).skip(limit * page).limit(limit),
    this.countDocuments(match),
  ]);

  return {
    records,
    total,
  };
}

schema.statics.formats = () => formats;

export default model<DiscRecordDocument, DiscRecordModel>('discrecord', schema);
