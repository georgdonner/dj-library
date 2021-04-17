export default {
  discogs: {
    token: String(process.env.DISCOGS_TOKEN),
  },
  spotify: {
    clientId: String(process.env.SPOTIFY_CLIENT_ID),
    clientSecret: String(process.env.SPOTIFY_CLIENT_SECRET),
  }
};
