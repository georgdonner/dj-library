import { Document, Model, Schema, Types, model } from 'mongoose';
import { DiscRecordDocument } from './DiscRecord';

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
      const { record, ...update } = track;
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

export default model<TrackDocument, TrackModel>('track', schema);
