const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

exports.videoStreaming = async (req, res) => {
  try {
    const videoId = req.params.id + '.mp4';
    const filePath = path.join(__dirname, `../../src/videos/${videoId}`);
    const findVideo = fs.readdirSync(path.join(__dirname, `../../src/videos`));
    for (let i = 0; i < findVideo.length; i++) {
      if (findVideo[i] == videoId) {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = (end - start) + 1;
          const fileStream = fs.createReadStream(filePath, { start, end });
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Range': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video.mp4'
          };
          res.writeHead(206, head);
          fileStream.pipe(res);
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(200, head);
          fs.createReadStream(path).pipe(res);
        }
      }
    }
  } catch (error) {
    console.error('Went Something Wrong', error);
    res.json({ error, status: false });
  }
};
