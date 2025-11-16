const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function Scrape(saveLog, date) {
    const url = "https://www.macvicarconsulting.com/readings/readingsmobil.htm";

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const td = $('td').filter((i, el) =>
    $(el).text().trim() === "Delray Beach"
    ).first();

    if (!td.length) {
        console.log("Could not find Jupiter");
        return;
    }

    const row = td.closest("tr");
    const allCells = row.children("td");  // only td elements

    const index = allCells.index(td);     // find td's position among only tds

    const city = allCells.eq(index + 0).text().trim();
    const flow = allCells.eq(index + 2).text().trim();
    const fwLevel = allCells.eq(index + 3).text().trim();
    const swLevel = allCells.eq(index + 4).text().trim();


    if (saveLog) {
        const fileName = city;
        const fileContent = `"${date.toLocaleString()}" "${city}" ${flow} ${fwLevel} ${swLevel}\n`

        if (!fs.existsSync('./logs')) {
            fs.mkdir('logs', (err) => {
                if (err) {
                    console.error('Error creating logs folder: '+err);
                } else {
                    console.log('Folder logs did not exist, created new folder.');
                }
            });
        }



        fs.appendFile('./logs/'+fileName+'.txt', fileContent, (err) => {
            if (err) {
                console.error('Error creating file: '+err);
            } else {
                console.log('Saved log to file');
            }
        });
    }
    
    return {city, flow, fwLevel, swLevel}
}
module.exports = Scrape;