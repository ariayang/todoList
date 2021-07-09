//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');


//console.log(date);

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static("public"));  
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});


//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = ["Udemy Web development", "Decide on next project"];

const itemsSchema = new mongoose.Schema ({
  name: {
      type: String,
      required: [true, "Please check your entry. No name specified"]
  }
});

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todo list"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
// item1.save();//=>no need, created error, because there's insertMany below. Otherwise, can use

/* used already. can be commented out*/
const defaultItems = [item1, item2, item3];


// Item.deleteMany({name: "<-- Hit this to delete an item"}, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Delete items to DB successfully");
//   }
// });


app.get("/", function (req, res) { 
  let day = date.getDay();
  //const day = date.getDate();
  //const itemsToRender = [];
Item.find({}, function(err, foundItems){
  //console.log(foundItems);
  //foundItems.forEach(function(todo) {
    //itemsToRender.push(todo.name);
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted many items to DB successfully");
        }
      });
      res.direct("/");
    } else {    
      res.render("list", { listTitle: day, newListItems: foundItems }); 
    }

  })
});
//need to have a views folder that contains the template file


app.get("/work", function(req, res){
    res.render("list", {listTitle: "Work", newListItems: workItems});
});

app.get("/about", function(req, res){
    res.render("about", {listTitle: "About", newListItems: workItems});
});

app.post("/", function (req, res) {
  let item = req.body.newItem;
  //console.log(req.body);
  if (req.body.list === "Work") {
      //console.log("within if" + req.body);
    workItems.push(item);
    res.redirect("/work");
  } else {
    //console.log(item);
    items.push(item);
    res.redirect("/");
  }
});

app.post("/work", function(req, res){
    let item = req.body.newItem;
    //console.log(item); ->never gets ran

});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});

//mongoose.connection.close();