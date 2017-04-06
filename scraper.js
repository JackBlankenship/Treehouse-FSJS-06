const Xray = require('x-ray');              // replace osmosis with x-ray
const json2csv = require('json2csv');       // json2csv node package
const fs = require('fs');                   // file system node package

var xray = new Xray();

function createDirectory(directory) {
  // from http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist/21196961#21196961
  function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') {    // allow the `mask` parameter to be optional
      cb = mask;                      
      mask = 0777;                          // full permission for user, group, other. 
    };
    fs.mkdir(path, mask, function(err) {
    if (err) {
      if (err.code == 'EEXIST') cb(null);   // ignore the error if the folder already exists
        else cb(err);                       // something else went wrong
      } else cb(null);                      // successfully created folder
    }
    );
  };

  ensureExists(__dirname + directory, 0744, function(err) {
    if (err) {console.log(err) }  // handle folder creation error
      else { }                    // we're all good
    });
};

function writeErrorLog(comment) {
    let time = new Date();
    fs.appendFile('scraper-error.log', time + ' ' + comment, function (err) {
        if (err) throw err;
        console.log('Connection error logged to scraper-error.log');
    });
};

function toCSV(shirts) {
  // Get and format date for file
  let fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
  let today = new Date();
  let todayFormatted = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

  for (let i = 0; i<shirts.length; i++) {     // update the Time with real data
      shirts[i]['Time'] = today.toString();
  }
  let csv = json2csv({ data: shirts, fields: fields });     // use the fields array to put the csv extract into the correct order.
  if(shirts.length !== 0) {                                 // not sure this check is needed as x-ray has real error handling while osmosis did not.
    fs.writeFile('data/' + todayFormatted + '.csv', csv, function (err) {
       if (err) throw err;
          console.log('file saved');
    });
  } else writeErrorLog('Unable to scrape shirts4mike at this time. Please try again in a few moments\n');
};

function scrapeContent() {
  createDirectory("/data");   // make my data directory if it does not exist

  xray('http://www.shirts4mike.com/shirts.php', '.products li', 
    [{
      Title:'img @alt',
      Price: xray("a@href", '.price'),
      ImageURL: 'img @src',
      URL: 'a@href',
      Time: ""          
    }]
  )
  (function(err, str) {
    if (err) {
      writeErrorLog("Connection error, make sure you are connected to the internet and try again in a few moments\n") 
    } else {
      toCSV(str);
    }
  });
  
};

scrapeContent();