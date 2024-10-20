const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');
const { Midjourney }= require("midjourney");

const app = express();
const port = 3001;
let midjourney=null;

app.use(cors());
app.use(bodyParser.json());

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
    console.log('Discord bot is online!');
    midjourney = await initMidjourney();
});

const initMidjourney = async () => {
    try {
      const midjourneyClient = new Midjourney({
        ServerId: '',
        ChannelId: '',
        SalaiToken: '', 
        Debug: true,
        ws:true,
      });
      await midjourneyClient.init();
      console.log('Midjourney client initialized successfully');
      return midjourneyClient;
    } catch (error) {
      console.error('Error initializing Midjourney client:', error);
      process.exit(1);
    }
  };

client.login('');

app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;

    const channel = client.channels.cache.get('');    
    if (channel) {
        try {
            const job = await midjourney.Imagine(prompt);
            console.log("Midjourney response:", job);
            if (job  && job.uri) {
                res.json({ status: 'Image generated', imageUrl: job });
            } else {
                res.status(500).json({ error: 'Failed to generate image or invalid response format.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to send the message to the channel' });
        }
    } else {
        res.status(404).json({ error: 'Channel not found' });
    }

});

app.post('/variation', async (req, res) => {
    const {customid,messageId,flags} = req.body;
  
    try {
      const CustomID = customid;  
      if (!CustomID) {
        return res.status(400).json({ message: 'No V1 option found' });
      }
      const Variation = await client.Custom({
        msgId: messageId,
        flags:flags,
        customId: CustomID,
        loading: (uri, progress) => {
          console.log("loading", uri, "progress", progress);
        }
      });
  
      res.json(Variation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error generating variation' });
    }
  });

  app.post('/upscale', async (req, res) => {
    const {customid,messageId} = req.body;
  
    try {
      const CustomID = customid;
      if (!CustomID) {
        return res.status(400).json({ message: 'No U1 option found' });
      }
      const Upscale = await client.Custom({
        msgId: messageId,
        flags: flags,
        customId: CustomID,
        // content: prompt,
        loading: (uri, progress) => {
          console.log("loading", uri, "progress", progress);
        }
      });
  
      res.json(Upscale);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error upscaling image' });
    }
  });

app.get('/test', async (req, res) => {
    res.json({ message: "work" }); 
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
