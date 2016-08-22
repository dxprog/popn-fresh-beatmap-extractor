const fs = require('fs');

const findAudioSection = require('./audio-detect');
const extractAudio = require('./extract-audio');
const extractFrames = require('./extract-frames');
const processFrames = require('./process-frames');

module.exports = function(videoFile) {
  var tmpFolder;
  var beatmapTime;
  var baseFile = videoFile.split('.');
  baseFile.pop();
  baseFile = baseFile.join('.');
  findAudioSection(videoFile).then(time => {
    beatmapTime = time;
    console.log(`Beatmap detected from ${time.start}-${time.end}`);
    return extractFrames(videoFile, time);
  }).then((tmp) => {
    console.log('Processing beatmap...');
    tmpFolder = tmp;
    return processFrames(tmpFolder.name);
  }).then((data) => {
    console.log(`Writing beatmap data to "${baseFile}.json`);
    tmpFolder.removeCallback();
    fs.writeFileSync(`${baseFile}.json`, data);
  }).then(() => {
    return extractAudio(videoFile, baseFile, beatmapTime);
  }).then(() => {
    console.log('Done!');
  }).catch(err => {
    console.log(err);
  });
};