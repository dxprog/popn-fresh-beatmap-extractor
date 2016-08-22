const exec = require('child_process').exec;

module.exports = function(videoFile, audioFile, time) {
  return new Promise((resolve, reject) => {
    console.log('Extracting audio...');
    exec(`ffmpeg -i "${videoFile}" -ss ${time.start} -t ${time.end - time.start} "${audioFile}.mp3"`, (err, stdout, stderr) => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
}