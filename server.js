const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/download', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL parameter' });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const json = await page.evaluate(() => {
      const script = document.querySelector('#__NEXT_DATA__');
      if (!script) return null;
      return JSON.parse(script.innerText);
    });

    await browser.close();

    if (!json) return res.status(500).json({ error: 'Could not load video data' });

    const videoData = json.props?.pageProps?.noteData;

    const result = {
      title: videoData?.title || 'Rednote Video',
      video_url: videoData?.video?.media?.[0]?.url || null,
      author: videoData?.user?.nickname || 'Unknown',
      duration: videoData?.video?.duration || 0
    };

    if (!result.video_url) {
      return res.status(500).json({ error: 'Could not extract video URL' });
    }

    return res.json(result);
  } catch (err) {
    if (browse
