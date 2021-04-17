import axios, { AxiosInstance } from 'axios';
import config from '../../config';
import { TrackDocument } from '../../db/models/Track';

type SpotifyTrack = {
  name: string;
  id: string;
}
type SpotifyTracks = {
  items: Array<SpotifyTrack>;
}
type SpotifyAlbum = {
  tracks: SpotifyTracks;
}

const cleanTrackName = (trackName: string) => trackName
  .replace(/\W/gi, '')
  .toLowerCase();

export default class Spotify {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        'User-Agent': 'DjLibrary/1.0',
      },
    });
  }

  private static async getToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    });

    const {clientId, clientSecret} = config.spotify;
    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from([clientId, clientSecret].join(':')).toString('base64')}`,
      },
    };

    const {data} = await axios
      .post('https://accounts.spotify.com/api/token', params, options);

    return data.access_token;
  } 

  public async init() {
    if (! this.api.defaults.headers.Authorization) {
      const token = await Spotify.getToken();

      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }

  private async fetchAlbum(albumID: string): Promise<SpotifyAlbum> {
    const res = await this.api
      .get(`albums/${albumID}`);
    return res.data;
  }

  private async fetchAudioFeatures(trackIDs: string[]): Promise<any> {
    const res = await this.api
      .get('/audio-features', {
        params: { ids: trackIDs.join(',') },
      });
    return res.data;
  }

  public async populateBpm(
    tracks: Array<TrackDocument>,
    albumID: string
  ): Promise<Array<TrackDocument>> {
    const album = await this.fetchAlbum(albumID);

    const matches = album.tracks.items
      .map(albumTrack => {
        const track = tracks.find(t => cleanTrackName(t.title) === cleanTrackName(albumTrack.name));
        if (track) {
          return [albumTrack.id, String(track._id)];
        }
        return [];
      })
      .filter(m => m.length);

    if (! matches.length) {
      return tracks;
    }

    const _features = await this.fetchAudioFeatures(matches.map(([id]) => id));
    const features: any[] = _features.audio_features;

    const matchesObj = Object.fromEntries(matches.map(m => m.reverse()));

    return tracks
      .map(track => {
        const spotifyID = matchesObj[track._id];
        const feature = features.find((feature: any) => feature.id === spotifyID);

        if (feature) {
          Object.assign(track, {bpm: Math.round(feature.tempo)})
        }

        return track;
      });
  }
}
