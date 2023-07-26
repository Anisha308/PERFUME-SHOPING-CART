const client = require('twilio')('ACcf579c18a8281da4edd4ea3fa0a03e77', 'ba132c414ca532023f64056066344fdc')


const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/fragrancia").then(() => {
    console.log("db connected");
})
const dotenv=require('dotenv')
dotenv.config({path:"./.env"})

const express = require('express')
const app = express()

app.use(express.static('public'));
app.use(express.static(__dirname + '/public/registration'))
app.use(express.static(__dirname + '/public/login'))
app.use(express.static(__dirname + '/public/fragrancia'))
app.use(express.static(__dirname + '/public/admin'))


const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/', adminRoute)



app.listen(process.env.PORT, () => {
    console.log(`server started at http://localhost:${process.env.PORT}`);
});




