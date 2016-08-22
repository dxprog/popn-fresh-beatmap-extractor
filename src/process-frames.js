const Canvas = require('canvas');
const fs = require('fs');
const Image = Canvas.Image;
const path = require('path');

const BOARD_X = 410;
const BOARD_Y = 60;
const BOARD_WIDTH = 456;
const BOARD_HEIGHT = 375;
const THRESHOLD = 200;
const SPEED_MULTIPLIER = 3.5;
const TRAVEL_DISTANCE = 484;

const COLS = [
  25,
  76,
  127,
  178,
  229,
  279,
  330,
  381,
  431
];

var FRAMES_PATH;

function padNumber(num, len) {
  var retVal = '' + num;
  while (retVal.length < len) {
    retVal = '0' + retVal;
  }
  return retVal;
}

function getPixel(x, y, data) {
  const index = ((y * BOARD_WIDTH) + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2]
  };
}

function extractBeatsFromImage(frame) {
  return new Promise((resolve, reject) => {
    const fileName = `${FRAMES_PATH}/popn-fresh${padNumber(frame, 4)}.png`;
    frame = frame < 1000 ? '0' + frame : frame;
    fs.readFile(fileName, (err, data) => {
      if (!err) {
        const img = new Image();
        img.src = data;
        const canvas = new Canvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT).data;

        const columns = new Array(COLS.length + 1);
        var i = 0, count = COLS.length, pixel, column, beat;
        for (var y = BOARD_HEIGHT - 1; y >= 0; y--) {
          for (i = 0; i < count; i++) {
            pixel = getPixel(COLS[i], y, pixels);
            column = columns[i];
            if ((pixel.r + pixel.g + pixel.b) / 3 > THRESHOLD) {
              if (!column || typeof column[column.length - 1] === 'number') {
                columns[i] = columns[i] || [];
                columns[i].push({
                  end: y,
                  start: -1
                });
              }
            } else {
              if (column && column.length && typeof column[column.length - 1] === 'object') {
                column[column.length - 1] = Math.round((column[column.length - 1].end - (y + 1)) / 2 + y + 1);
              }
            }
          }
        }
        resolve(columns);
      } else {
        if (err.errno === -2) {
          resolve(true);
        } else {
          reject(err);
        }
      }
    });
  });
}

function readFrames() {
  return new Promise((resolve, reject) => {
    const frames = [];
    function readFrame(frame) {
      return new Promise((resolve, reject) => {
        console.log(`Reading frame ${frame}`);
        extractBeatsFromImage(frame).then((beats) => {
          // If we got a boolean true back, all the frames have been read
          if (beats === true) {
            resolve();
          } else {
            frames.push(beats);
            return readFrame(++frame).then(resolve);
          }
        }, (err) => {
          console.error(err);
        });
      });
    }

    readFrame(1).then(() => {
      resolve(frames);
    });
  });
}

function extractBeat(frames, frame, col) {
  var beatFrames = [ frames[frame++][col].shift() ];
  var position;
  for (var i = frame, count = frames.length; i < count; i++) {
    if (frames[i][col] && frames[i][col].length) {
      position = frames[i][col][0];
      if (position > beatFrames[beatFrames.length - 1]) {
        beatFrames.push(frames[i][col].shift());
      } else {
        break;
      }
    }
  }

  // Something only on screen for a frame is probably messed up
  var retVal = null;
  if (beatFrames.length > 1) {
    var total = 0;
    beatFrames.forEach((y, index) => {
      total += index > 0 ? y - beatFrames[index - 1] : 0;
    });
    var speed = total / beatFrames.length;
    retVal = {
      speed: speed,
      time: frame / 30 + (TRAVEL_DISTANCE - beatFrames[0]) / speed,
      col: col
    };
  }

  return retVal;
}

function framesToBeatmap(frames) {
  var beats = [];
  var frame, j, beat;
  for (var i = 0, count = frames.length; i < count; i++) {
    frame = frames[i];
    if (frame) {
      for (j = 0; j < 9; j++) {
        if (frame[j]) {
          while (frame[j].length) {
            beat = extractBeat(frames, i, j);
            if (beat) {
              beats.push(beat);
            }
          }
        }
      }
    }
  }
  return beats;
}

module.exports = function(framePath) {
  FRAMES_PATH = framePath;
  console.log(FRAMES_PATH);
  return readFrames().then((frames) => {
    var beatmap = framesToBeatmap(frames);
    return JSON.stringify(beatmap);
  }).catch((err) => {
    console.log(err);
  });
};