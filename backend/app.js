const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();
mongoose.connect("mongodb+srv://mariazac:" + process.env.MONGO_ATLAS_PW + "@cluster0-jsznh.mongodb.net/node-angular",{useNewUrlParser: true})
        .then(() =>{
          console.log('Connected to database!');
        })
        .catch((error) =>{
          console.log(error);
          console.log('Connection failed!');
        })
app.use("/images", express.static(path.join("images")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req,res,next) =>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next();
})

app.use("/api/posts",postRoutes);
app.use("/api/user",userRoutes);

module.exports = app;
