const fs = require('fs');

const findAudioSection = require('./audio-detect');
const extractFrames = require('./extract-frames');
const processFrames = require('./process-frames');

module.exports = function(videoFile) {
  var tmpFolder;
  findAudioSection(videoFile).then(time => {
    console.log(`Beatmap detected from ${time.start}-${time.end}`);
    return extractFrames(videoFile, time);
  }).then((tmp) => {
    console.log('Processing beatmap...');
    tmpFolder = tmp;
    return processFrames(tmpFolder.name);
  }).then((data) => {
    tmpFolder.removeCallback();
    const outFile = videoFile.split('.');
    outFile.pop();
    fs.writeFileSync(`${outFile.join('.')}.json`, data);
  }).catch(err => {
    console.log(err);
  });
};