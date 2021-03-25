import { Document, Model, Schema, Types, model } from 'mongoose';
import TrackModel, { TrackWithoutRecord, Track } from './Track';

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
  label: string;
  year: number;
  coverImg: string;
  tempo: number;
  styles: Array<string>;
  notes: string;
};

interface DiscRecordWithTracks extends DiscRecord {
  tracks: Array<TrackWithoutRecord>;
}

export interface DiscRecordDocument extends DiscRecord, Document {
  artists: Types.Array<string>;
  styles: Types.Array<string>;
};

export interface DiscRecordModel extends Model<DiscRecordDocument> {
  populateTracks(id: string): Promise<DiscRecordWithTracks>
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

export default model<DiscRecordDocument, DiscRecordModel>('discrecord', schema);
