import axios, { AxiosInstance } from 'axios';
import DiscRecordModel, { DiscRecordWithTracks } from '../../db/models/DiscRecord';
import { TrackWithoutRecord } from '../../db/models/Track';

export default class Discogs {
  private api: AxiosInstance;

  constructor(token: string) {
    this.api = axios.create({
      baseURL: 'https://api.discogs.com/',
      headers: {
        'User-Agent': 'DjLibrary/1.0',
        'Authorization': `Discogs token=${token}`,
      },
    });
  }

  private static parseReleaseUrl(releaseUrl: string): string | undefined {
    const url = new URL(releaseUrl);
    return url.pathname
      .split('/')
      .pop();
  }

  private static parseFormat(formats: Array<any>): string | undefined {
    const vinylFormat = formats
      .find((format: any) => format.name === 'Vinyl');
    
    let format;
    if (vinylFormat) {
      format = DiscRecordModel.formats()
        .find(f => vinylFormat.descriptions.includes(f));
    }

    return format;
  }

  private static parseTracklist(tracklist: Array<any>): Array<TrackWithoutRecord> {
    const parseDuration = (duration: string): number => {
      const [m=0, s=0] = duration.split(':');
      return +m * 60 + +s;
    }

    return tracklist
      .filter(({ type_ }) => type_ === 'track')
      .map(track => ({
        title: track.title,
        side: track.position.charCodeAt(0) - 65,
        duration: parseDuration(track.duration),
      }));
  }

  private static parseRelease(release: any): DiscRecordWithTracks {
    const artists = release.artists
      .map((artist: any) => artist.name);

    const tracks = Discogs.parseTracklist(release.tracklist);

    const record: DiscRecordWithTracks = {
      title: release.title,
      artists,
      tracks,
      label: release.labels[0].name,
      year: release.year,
      coverImg: release.images[0].uri,
      styles: release.styles,
    };

    const format = Discogs.parseFormat(release.formats);
    if (format) {
      record.format = format;
    }
    
    return record;
  }

  private fetchRelease(releaseID: string): Promise<any> {
    return this.api
      .get(`/releases/${releaseID}`);
  }

  public async fetchRecord(releaseUrl: string): Promise<DiscRecordWithTracks | null> {
    const releaseID = Discogs.parseReleaseUrl(releaseUrl);

    if (! releaseID) {
      throw new Error(`Release not found for url ${releaseUrl}`);
    }

    const {data: release} = await this.fetchRelease(releaseID);

    if (! release) {
      throw new Error(`Error fetching release with url ${releaseUrl}`);
    }

    return Discogs.parseRelease(release);
  }
}
