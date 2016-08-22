const exec = require('child_process').exec;

const SILENCE_REGEX = /silence_(start|end): ([\d\.]+)/ig

function parseSilenceData(data) {
  const silenceTimes = [];
  var time = {};
  var match;

  while (match = SILENCE_REGEX.exec(data)) {
    time[match[1]] = parseFloat(match[2]);
    if (match[1] === 'end') {
      silenceTimes.push(time);
      time = {};
    }
  }

  // The song begins at the end of the first silence and the beginning of the last
  const start = silenceTimes.shift();
  const end = silenceTimes.pop();
  return {
    start: start.end,
    end: end.start
  }
}

module.exports = function(videoFile) {
  return new Promise((resolve, reject) => {
    console.log('Finding beatmap from audio...');
    exec(`ffmpeg -i "${videoFile}" -af silencedetect=n=-30dB:d=2 -f null -`, (err, stdout, stderr) => {
      if (!err) {
        resolve(parseSilenceData(stderr));
      } else {
        reject(err);
      }
    });
  });
}