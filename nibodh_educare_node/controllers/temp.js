const Pool = require("pg").Pool;
const fs = require("fs");
const fastcsv = require("fast-csv");
var multer = require('multer')

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
            return res.status(200).send(req.file)

        });
    }
    uploadCSVFile(req, res) {

        let stream = fs.createReadStream("public/temp.csv");
        let csvData = [];
        let csvStream = fastcsv
            .parse()
            .on("data", function (data) {
                csvData.push(data);
            })
            .on("end", function () {
                // remove the first line: header
                csvData.shift();

                // create a new connection to the database
                const pool = new Pool({
                    host: "localhost",
                    user: "postgres",
                    database: "postgres",
                    password: "admin",
                    port: 5432
                });

                const query = "INSERT INTO userd (id, name, salary) VALUES ($1, $2, $3)";

                pool.connect((err, client, done) => {
                    if (err) throw err;
                    try {
                        csvData.forEach(row => {
                            client.query(query, row, (err, res) => {
                                if (err) {
                                    console.log(err.stack);
                                } else {
                                    console.log("inserted " + res.rowCount + " row:", row);
                                }
                            });
                        });
                    } finally {
                        done();
                    }
                });
            });

        stream.pipe(csvStream);
    }
}
module.exports = new UploadCSVCtrl();
