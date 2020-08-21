const express = require("express");
var router = express.Router();

const UploadCSVCtrl = require("../controllers/uploadCSV");

// router.post('/uploadCSVFile', UploadCSVCtrl.uploadCSVFile);
router.post('/uploadFile', UploadCSVCtrl.uploadFile);

module.exports = router;
