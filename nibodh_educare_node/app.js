const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const router = require("./routes/fileUpload_routes");
const cors = require("cors");

var corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(bodyParser.json())


app.listen(3100, () => {
    console.log("Server is listening at PORT 3100");
});

app.use(router);