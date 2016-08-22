const findAudioSection = require('./audio-detect');

module.exports = function(videoFile) {
  findAudioSection(videoFile).then(data => {
    console.log(data);
  }).catch(err => {
    console.log(err);
  });
};