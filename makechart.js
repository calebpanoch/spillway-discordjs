// chart.js imports
const { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } = require('chart.js');

// skia-canvas
const { Canvas } = require('skia-canvas');

// node fs/promises (Node 18+)
const fsp = require('node:fs/promises');

// node fs (callback-based)
const fs = require('fs');


async function MakeChart() {
    Chart.register([
    CategoryScale,
    LineController,
    LineElement,
    LinearScale,
    PointElement
    ]);

    const canvas = new Canvas(400, 300);


    const data = fs.readFileSync("./logs/Delray Beach.txt", "utf-8");
    const lines = data.split("\n");
    const last24 = lines.slice(-24);
    //hour regex \s([^:]+):

    //minute :[^:]*:([^:]*):

    x = []
    y = []

    

    for (const line of last24) {
        // x labels
        const trimLine = line.match(/\d{1,2}:\d{2}:\d{2}\s[AP]M/);
        if (trimLine) {
            console.log(trimLine[0].trim());
            x.push(trimLine[0].trim());
        }


        // y values
        const trimLine2 = line.match(/"\w[\w\s]*"\s+(\d+(?:\.\d+)?)/);
        if (trimLine2) {
            console.log(trimLine2[1]);
            y.push(trimLine2[1]);
        }
    }


    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                data: y,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'My Line Chart', // Chart title
                    font: {
                        size: 20
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time', // X-axis label
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Flow', // Y-axis label
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });

    const pngBuffer = await canvas.toBuffer('png', { matte: 'white' });
    await fsp.writeFile('output.png', pngBuffer);

    chart.destroy();



}
//MakeChart();

module.exports = MakeChart;