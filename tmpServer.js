/*  
    A Node.js server that temperature and humidity values from a log file.
    Also uses Node static to serve static files

    Ching Yiu Stephen Leung, 11 Feb 2015
    Ref:https://github.com/talltom/PiThermServer
*/
var fs = require('fs');
var sys = require('sys');
var http = require('http');
var nodestatic = require('node-static');
var staticServer = new nodestatic.Server();
var log = fs.readFileSync('/home/pi/tmph/tmp.txt');
var logTime = Date.now()

function updateCache() {
    // Update the cache if the cache is older than one minute old
    if (Date.now() - logTime > (1000*60)) {
        log = fs.readFileSync('/home/pi/tmph/tmp.txt');
        logTime = Date.now();

        return true;
    }
    return false;
}

function getNumRecord() {
    // Return the number of records entries
    updateCache();

    var entries = log.toString('ascii').split(/\n/);
    return entries.length-1;
}

function getTmp(hist) {
    // Read the record and get the record at index 'hist' from the lastest
    updateCache();
    if (hist > getNumRecord()-1) {
        throw "Out of range";
    }
    var entries = log.toString('ascii').split(/\n/);
    var data = entries[entries.length-(2+hist)].split(" ");

    // Format it nicely
    var entry  = {
        date: data[0],
        time: data[1],
        tmp1: parseFloat(data[2]),
        tmp2: parseFloat(data[3]),
        humidity: parseFloat(data[4])
    };

    return entry;
}

function buildJson(hist) {
    // Request for the specific entry
    var data;
    try {
        var entry = getTmp(hist);

        // Put it in to a json format for sending
        data = {
            temperature_record:[{
                unix_time: getUNIXTime(entry),
                celsius1: entry.tmp1,
                celsius2: entry.tmp2,
                humidity: entry.humidity
            }]
        };
    } catch(err) {
        // If request is out of range, return a empty record
         data = {
            temperature_record:[]
        }
    }

    return data;
}

function buildLogJson(fromDate) {
    var index = getNumRecord()-1;
    var entry = getTmp(index);
    var date = getUNIXTime(entry);

    // Ignore records older than fromDate
    while ((date < fromDate) && (index > 0)) {
        index--;
        entry = getTmp(index);
        date = getUNIXTime(entry);
    }

    // Push remaining records into an array
    var record = [];
    while (index > 0) {
        record.push({
            unix_time: getUNIXTime(entry),
            celsius1: entry.tmp1,
            celsius2: entry.tmp2,
            humidity: entry.humidity
        });

        index--;
        entry = getTmp(index);
        date = getUNIXTime(entry);
    }

    // Wrap array in json
    var data = {temperature_record: record};
    return data;
}

function getUNIXTime(entry) {
    // Extract the date and time from the record and return it in UNIX time
    var date = String(entry.date).split("/")
    var year = date[2];
    var month = date[1] - 1;
    var day = date[0];

    var clock = String(entry.time).split(":")
    var hour = clock[0];
    var min = clock[1];
    var sec = clock[2];

    var d = new Date(year, month, day, hour, min, sec, 0);

    return d.getTime();
}

http.createServer(function (req, res) {
    var url = require('url').parse(req.url, true);
    var pathfile = url.pathname;
    var query = url.query;

    if (pathfile == '/temperature_now.json') {
        // Get a record and sent it
        var hist = 0;
        if (query.hist) {
            hist = parseInt(query.hist);
        }

        var json = buildJson(hist);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(json), "ascii");
    } else if (pathfile == '/temperature_log.json') {
        // Get a section of records and sent it
        var fromDate = Date.now() - (48*60*60*1000) // Default fromDate to 2 days ago
        if (query.fromDate) {
            fromDate = parseInt(query.fromDate);
        }

        var json = buildLogJson(fromDate);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(json), "ascii");
    } else if (pathfile == '/numRecord.txt') {
        // Get the total number of record and sent it
        var numRecord = getNumRecord();
        console.log(numRecord);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(String(numRecord), "ascii");
    } else {
        // Serve static files
        staticServer.serve(req, res, function(err, result) {
            if (err) {
                sys.error("Error serving " + req.url + " - " + err.message);
                res.writeHead(err.status, err.headers);
                res.end('Error 404 - file not found');
            }
            return;
        });
    }
    

}).listen(8000, '192.168.0.100');
console.log('Server running at http://192.168.0.100:8000');