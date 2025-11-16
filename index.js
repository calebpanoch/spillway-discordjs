// Import required modules 
const cron = require("node-cron");
const { Client, GatewayIntentBits, ActivityType, AttachmentBuilder } = require('discord.js'); 
require('dotenv').config();
const Scrape = require('./scraper');
const MakeChart = require("./makechart");
const fs = require("fs");

const Prefix = ','
var lastChecked = new Date()

// Create a new Discord client with message intent 
const client = new Client({ 
    intents: [ 
    GatewayIntentBits.Guilds,  
    GatewayIntentBits.GuildMessages,  
    GatewayIntentBits.MessageContent] 
});





// Bot is ready 
client.once('clientReady', async () => { 
        console.log(`🤖 Logged in as ${client.user.tag}`); 
        const result = await Scrape();
        client.user.setPresence({ 
            activities: [{ 
                name: 'Delray Spillway Flow = '+result.flow, 
                type: ActivityType.Watching, 
            }], 
            status: 'online' 
        });
}); 

// Listen and respond to messages 
client.on('messageCreate', async message => { 

    // Ignore messages from bots 
    if (message.author.bot) return; 
    if (message.content.substring(0,1) != Prefix) return;

    var command = message.content.toLowerCase();
    command = command.match("(?<=,)[^ ]+");

    console.log("Command used: '"+command+"'")

    // Respond to a specific message 
    if (command == 'ping') {
        message.reply('Hi there! 👋 I am your friendly bot.');
    } else if (command == 'flow') {
        const result = await Scrape();
        console.log(result);
        message.reply('Current flow at Delray Spillway: '+result.flow);
    } else if (command == "lastchecked" || command == "lc") {
        message.reply('Last checked '+lastChecked.toLocaleString());
    } else if (command == "setup") {
        const data = fs.readFileSync("./channels.txt", "utf-8");
        const lines = data.split("\n")

        channelIDs = [];
        for (const line of lines) {
            if (!line.trim()) continue;
            const [id, ...rest] = line.split(" ");
            channelIDs.push(id);
        }

        if (!channelIDs.includes(message.channelId)) {
            const result = await Scrape();

            fs.appendFile('channels.txt', `${message.channelId} ${result.flow}\n`, (err) => {
                if (err) {
                    console.error('Error creating file: '+err);
                } else {
                    console.log('Saved log to file');
                }
            });
        } else {
            message.reply("Channel is already setup for alerts.");
        }
    } else if (command == "removealerts") {

    } else if (command == "chart") {
        await MakeChart();

        const attachment = new AttachmentBuilder('./output.png');

        message.reply({ files: [attachment] });
    }
});

cron.schedule("* * * * *", async () => {
    console.log("Runs every minute:", new Date().toISOString());
    lastChecked = new Date();



    const result = await Scrape();
    client.user.setPresence({ 
        activities: [{ 
            name: 'Delray Spillway Flow = '+result.flow, 
            type: ActivityType.Watching, 
        }], 
        status: 'online' 
    });
});

cron.schedule("0 * * * *", async () => {
    console.log("Runs every hour:", new Date().toISOString());
    lastChecked = new Date();

    const result = await Scrape(true, lastChecked);

    const data = fs.readFileSync("./channels.txt", "utf-8");
    const lines = data.split("\n")

    channelIDs = [];
    for (const line of lines) {
        if (!line.trim()) continue;
        const [id, lastFlowValue] = line.split(" ");
        
        client.channels.fetch(id)
        .then(channel => {
            if (result.flow > lastFlowValue) {
                channel.send("@here Flow value has gone up");
            }
        })
        .catch(console.error);
    }
});

// Log in to Discord using token from .env 
client.login(process.env.DISCORD_TOKEN); 
