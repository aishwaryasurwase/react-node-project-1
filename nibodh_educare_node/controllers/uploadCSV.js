const Pool = require("pg").Pool;
const fs = require("fs");
const fastcsv = require("fast-csv");
var multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
var upload = multer({ storage: storage }).single('file');

class UploadCSVCtrl {
    constructor() { }

    uploadFile(req, res) {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json(err);
            } else if (err) {
                return res.status(500).json(err)
            }
            let uploadFileName = req.file.filename;
            // console.log("filename ", req.file.filename);
            // console.log("extension ", path.extname(req.file.originalname));

            let stream = fs.createReadStream("public/" + uploadFileName);
            let csvData = [];
            let csvStream = fastcsv
                .parse()
                .on("data", function (data) {
                    csvData.push(data);
                })
                .on("end", function () {
                    // create a new connection to the database
                    const pool = new Pool({
                        host: "localhost",
                        user: "postgres",
                        database: "postgres",
                        password: "admin",
                        port: 5432
                    });

                    // console.log("Header ", csvData[0]);
                    let columnNames = csvData[0];
                    console.log("Column names ", columnNames);

                    // drop table
                    const dropQuery = "DROP TABLE IF EXISTS USERS";

                    // create table
                    const createQuery = `CREATE TABLE USERS(${columnNames[0]} VARCHAR(255), ${columnNames[1]} VARCHAR(255), 
                    ${columnNames[2]} VARCHAR(255), ${columnNames[3]} VARCHAR(255), ${columnNames[4]} VARCHAR(255));`

                    pool.connect((err, client, done) => {
                        if (err) throw err;
                        try {
                            client.query(dropQuery, (err, res) => {
                                if (err) {
                                    console.log("Error in drop table", err.stack);
                                    return res.status(500).json(err);
                                } else {
                                    console.log("Drop table successfully.");
                                    client.query(createQuery, (err, res) => {
                                        if (err) {
                                            console.log("Error in create table", err.stack);
                                            return res.status(500).json(err);
                                        } else {
                                            console.log("Create table successfully.");
                                            csvData.shift();

                                            const query = `INSERT INTO users VALUES ($1, $2, $3, $4, $5)`;

                                            pool.connect((err, client, done) => {
                                                if (err) throw err;
                                                try {
                                                    csvData.forEach(row => {
                                                        client.query(query, row, (err, res) => {
                                                            if (err) {
                                                                console.log("Error in insert data into database", err.stack);
                                                            } else {
                                                                console.log("inserted " + res.rowCount + " row:", row);
                                                            }
                                                        });
                                                    });
                                                } finally {
                                                    done();
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        } finally {
                            done();
                        }
                        return res.status(200).send(req.file);
                    });
                });
            stream.pipe(csvStream);
        });
    }
}
module.exports = new UploadCSVCtrl();
