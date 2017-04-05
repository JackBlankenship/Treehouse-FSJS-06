
const osmosis = require('osmosis');           // scraper node package
const json2csv = require('json2csv');         // json2csv node package
const fs = require('fs');                     // file system node package

let shirtsArray = [];

let fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

function createDirectory(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
};

function writeErrorLog(comment) {
    let time = new Date();
    fs.appendFile('scraper-error.log', time + ' ' + comment, function (err) {
        if (err) throw err;
        console.log('Connection error logged to scraper-error.log');
    });
};

function toCSV() {
    // Get and format date for file
    let today = new Date();
    let todayFormatted = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

    let csv = json2csv({ data: shirtsArray, fields: fields });

    if(shirtsArray.length !== 0) {
        createDirectory("./data");
        fs.writeFile('data/' + todayFormatted + '.csv', csv, function (err) {
            if (err) throw err;
            console.log('file saved');
        });
    } else writeErrorLog('Unable to scrape shirts4mike at this time. Please try again in a few moments\n');
};
function getFullURL(ImageURL) {
    let position = ImageURL.indexOf(".jpg");
    let shirtNum = ImageURL.substr(position - 3, 3);
    return 'http://www.shirts4mike.com/shirt.php?id=' + shirtNum;
}
function scrapeContent() {
    osmosis
        .get('http://www.shirts4mike.com/shirts.php')       // Connecting to main site
        .set({'URL': '.products a@href'})                   // Setting URL variable in Object however, only grabing the first occurance.
        .follow('.products a@href')                         // Iterating through the shirt links
        .set({
            'Title':'.shirt-picture @alt',
            'Price': '.price',
            'ImageURL': 'img @src',
            })                                              // Setting More variables
        // 
        .data(function(shirt) {
            shirt.URL = getFullURL(shirt.ImageURL);
            shirt.ImageURL = 'http://www.shirts4mike.com/' + shirt.ImageURL;
            //shirt.URL = 'http://www.shirts4mike.com/' + shirt.URL;
            let nowStamp = new Date();
            shirt.Time = nowStamp.toString();
            console.dir(osmosis.window);
            shirtsArray.push(shirt);
            })
        .done(toCSV)
        .error("Unable to establish a connection with shirts4mike site\n");

};

scrapeContent();