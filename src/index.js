const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const  mongoose  = require('mongoose');
const app = express();

const multer= require("multer");
app.use(bodyParser.json());

app.use(multer().any())

mongoose.connect("mongodb+srv://restapi:YxG6pvVdRkKiSH9k@cluster0.nedsvqo.mongodb.net/P-5(Group-27)", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

app.listen( 3000, function () {
    console.log('Express app running on port ' + (3000))
});