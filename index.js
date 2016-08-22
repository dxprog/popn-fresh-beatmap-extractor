const processVideo = require('./src/process-video');

const args = Array.prototype.slice.call(process.argv, 2);
const file = args.shift();

if (file) {
  processVideo(file);
} else {
  console.error('USAGE: node index.js /path/to/video.mp4');
}