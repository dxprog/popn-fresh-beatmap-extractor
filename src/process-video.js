const findAudioSection = require('./audio-detect');
const extractFrames = require('./extract-frames');

module.exports = function(videoFile) {
  findAudioSection(videoFile).then(time => {
    console.log(`Beatmap detected from ${time.start}-${time.end}`);
    return extractFrames(videoFile, time);
  }).then((tmp) => {
    console.log('made it here');
    tmp.removeCallback();
  }).catch(err => {
    console.log(err);
  });
};