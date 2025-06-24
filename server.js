const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/download', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL parameter' });

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });

    const $ = cheerio.load(html);
    const jsonData = $('script#__NEXT_DATA__').html();

    if (!jsonData) throw new Error('Video data not found');

    const parsed = JSON.parse(jsonData);
    const videoData = parsed.props.pageProps.noteData;

    const result = {
      title: videoData.title || 'Rednote Video',
      video_url: videoData.video?.media?.[0]?.url || null,
      author: videoData.user?.nickname || 'Unknown',
      duration: videoData.video?.duration || 0
    };

    if (!result.video_url) {
      throw new Error('Could not extract video URL');
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
