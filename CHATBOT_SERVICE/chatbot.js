const papa = require("papaparse");
const axios = require("axios").default;

// asynchronous function to make api request through axios library
async function parseCSVtoString(message, user) {
    try {
        const format = message.startsWith("/stock=");
        if (format) {
            const code = message.slice(7);
            const response = await axios.get(`https://stooq.com/q/l/?s=${code}&f=sd2t2ohlcv&h&e=csv`);
            const csvParsed = papa.parse(response.data);
            const rowValues = csvParsed.data[1];
            const string = `${rowValues[0]} quote is $${rowValues[6]} per share`;
            return { message: string, user: "TvGram Bot" }
        }
        else {
            return { message: message, user: user };
        }
    }
    catch (error) {
        console.error(error);
    }
}



module.exports = parseCSVtoString;