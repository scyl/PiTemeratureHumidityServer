/*  
    A Node.js server that temperature and humidity values from a log file.
    Also uses Node static to serve static files

    Ching Yiu Stephen Leung, 11 Feb 2015
    Ref:https://github.com/talltom/PiThermServer
*/
var fs = require('fs');
var sys = require('sys');
var http = require('http');
var sqlite3 = require('sqlite3');
var nodestatic = require('node-static');
var staticServer = new nodestatic.Server();

// Setup database connection for reading the log
var db = new sqlite3.Database('./log.db');

function getNumRecord(res, callback) {
    // Return the number of records entries
    var num = db.all("SELECT COUNT(*) AS count FROM temperature_records", function(err, rows) {
        //console.log(String(rows[0].count));
        callback(rows[0].count);
    })
}

function getRecordOnNum(numToGet, callback) {
    db.all("SELECT * FROM temperature_records ORDER BY unix_time DESC LIMIT ?;", numToGet, function(err, rows) {
        if (err) {
            console.error("Error querying database!\n" + err);
        } else {
            callback({temperature_records:rows});
        }
    })
}

function getRecordOnDate(fromDate, callback) {
    db.all("SELECT * FROM temperature_records WHERE unix_time > (?) ORDER BY unix_time ASC;", fromDate, function(err, rows) {
        if (err) {
            console.error("Error querying database!\n" + err);
        } else {
            callback({temperature_records:rows});
        }
    })
}

http.createServer(function (req, res) {
    var url = require('url').parse(req.url, true);
    var pathfile = url.pathname;
    var query = url.query;

    if (pathfile == '/logNum.json') {
        // Get a record and sent it
        var numToGet = 0;
        if (query.numToGet) {
            numToGet = parseInt(query.numToGet);
        }

        getRecordOnNum(numToGet, function(data) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data), "ascii");
        });
        
    } else if (pathfile == '/logFromDate.json') {
        // Get a section of records and sent it
        var fromDate = parseInt(Date.now()/1000) - (48*60*60) // Default fromDate to 2 days ago
        if (query.fromDate) {
            fromDate = parseInt(query.fromDate);
        }
        console.log(fromDate);
        getRecordOnDate(fromDate, function(data) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data), "ascii");
        });

    } else if (pathfile == '/numRecord.txt') {
        // Get the total number of record and sent it
        getNumRecord(res, function(data) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(String(data), "ascii");
        });

    } else {
        // Serve static files
        staticServer.serve(req, res, function(err, result) {
            if (err) {
                console.error("Error serving " + req.url + " - " + err.message);
                res.writeHead(err.status, err.headers);
                res.end('Error 404 - file not found');
            }
            return;
        });
    }
    

}).listen(8000, '192.168.0.100');
console.log('Server running at http://192.168.0.100:8000');