const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer')

app.use(bodyParser.json());
app.use(multer().any())

mongoose.connect("mongodb+srv://bansalmonika123:mona@cluster0.4rsiaju.mongodb.net/group13Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);

app.use("/*", function (req, res) {
    res.status(404).send({ status: false, message: "Kindly give correct information in path param ! UNDERSTAND" });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});