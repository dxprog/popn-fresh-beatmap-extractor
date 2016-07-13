const Canvas = require('canvas');
const fs = require('fs');
const Image = Canvas.Image;
const path = require('path');

const BOARD_X = 410;
const BOARD_Y = 60;
const BOARD_WIDTH = 456;
const BOARD_HEIGHT = 375;
const FRAMES_PATH = path.resolve('/home/matt/choco_smile');
const THRESHOLD = 200;
const START = 335;
const END = 4026;

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

function getPixel(x, y, data) {
  const index = ((y * BOARD_WIDTH) + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2]
  };
}

function extractBeatsFromFrame(frame) {
  return new Promise((resolve, reject) => {
    frame = frame < 1000 ? '0' + frame : frame;
    fs.readFile(path.resolve(FRAMES_PATH, `${frame}.png`), (err, data) => {
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
        reject(err);
      }
    });
  });
}

function analyzeColumn(col, data) {
  var index, pixel, distance;
  var lastPixel;
  for (var y = 0; y < BOARD_HEIGHT; y++) {
    index = ((y * BOARD_WIDTH) + col) * 4;

    if (pixel.r > 200 && pixel.g > 200 && pixel.b > 200) {
      console.log(y);
    }
    lastPixel = pixel;
  }
}

function readBeatmap() {
  return new Promise((resolve, reject) => {
    const beatmap = [];
    function readFrame(frame) {
      return new Promise((resolve, reject) => {
        if (frame > END) {
          resolve();
        } else {
          console.log(`Reading frame ${frame}`);
          extractBeatsFromFrame(frame).then((beats) => {
            beatmap.push(beats);
            return readFrame(++frame).then(resolve);
          }, (err) => {
            console.log(err);
          });
        }
      });
    }

    readFrame(START).then(() => {
      resolve(beatmap);
    });
  });
}

readBeatmap().then((beatmap) => {
  console.log(beatmap);
});