const exec = require('child_process').exec;
const tmp = require('tmp');

module.exports = function(videoFile, time) {
  return new Promise((resolve, reject) => {
    const renderDir = tmp.dirSync({ unsafeCleanup: true });
    console.log(`Extracting frames to ${renderDir.name}...`);
    const duration = time.end - time.start;
    exec(`ffmpeg -i "${videoFile}" -filter:v fps=fps=30 -ss ${time.start} -t ${duration} ${renderDir.name}/popn-fresh%04d.png`, (err, stdout, stderr) => {
      console.log(err, duration, renderDir.name);
      resolve(renderDir);
    });
  });
};