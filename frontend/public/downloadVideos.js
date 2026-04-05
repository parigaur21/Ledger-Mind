import https from 'https';
import fs from 'fs';

const downloads = [
  { url: 'https://assets.mixkit.co/videos/download/mixkit-moving-through-a-futuristic-glowing-tunnel-26038-hd-ready.mp4', name: 'landing_bg.mp4' },
  { url: 'https://assets.mixkit.co/videos/download/mixkit-abstract-background-of-a-digital-network-tunnel-32369-hd-ready.mp4', name: 'dashboard_bg.mp4' }
];

downloads.forEach(d => {
  console.log(`Downloading ${d.name}...`);
  const file = fs.createWriteStream(d.name);
  https.get(d.url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      https.get(response.headers.location, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`${d.name} download complete.`);
        });
      });
    } else {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`${d.name} download complete.`);
      });
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${d.name}:`, err.message);
  });
});
