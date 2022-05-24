const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const  mongoose  = require('mongoose');
const app = express();

const multer= require("multer");
const { AppConfig } = require('aws-sdk');
app.use(bodyParser.json());

app.use(multer().any())

mongoose.connect("mongodb+srv://jayvision:KQK8eFQqxCASWGRF@cluster0.6lmc5.mongodb.net/group27Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

