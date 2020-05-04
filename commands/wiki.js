const https = require('https');
const findC = require('../find_con');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { IBM_token, IBM_url } = require('../config.json');
let m, c;

const get_wiki = (link, cb) => {
  https.get(link, res => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // Consume response data to free up memory
      cb(error);
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        cb(null, parsedData);
      } catch (e) {
        console.error(e.message);
        cb(e);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
}

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({ apikey: IBM_token }),
  url: IBM_url
});

const params = {
  text: '',
  voice: 'en-US_AllisonVoice', // Optional voice
  accept: 'audio/mp3'
};

const handler = (err, val) => {
  if (err || val.query.search.length === 0) {
    console.error(err);
    m.channel.send('Couldn\'t find anything!');
    return;
  }
  const page_title = val.query.search[0].title;
  const extract = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exsentences=3&exlimit=1&titles=${page_title}&explaintext=1&formatversion=2`;
  get_wiki(extract, (err, val) => {
    if (err || val.query.pages.length === 0) {
      console.error(err);
      m.channel.send('Couldn\'t find anything!');
      return;
    }
    const info = val.query.pages[0].extract;
    params.text = info;
    textToSpeech
      .synthesize(params)
      .then(async response => {
        const audio = response.result;
        const con = await m.member.voice.channel.join();
        const disp = con.play(audio);
        c.reading = true;
        disp.on('finish', () => c.reading = false);
      })
      .catch(err => {
        console.log(err);
        m.channel.send('There was an error reading');
      });
    m.channel.send(info);
  });
}

module.exports = {
  name: 'wiki',
  description: 'Read a short info about a topic',
  execute(message, args, client) {
    c = findC(message, client);
    if (c === undefined || args.length === 0) return;

    if (c.playing) {
      message.reply('Something\'s already playing right now!');
      return;
    }

    m = message;
    const keyword = args.join(' ');
    const search = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${keyword}&utf8=&format=json`;
    get_wiki(search, handler);
  },
};


