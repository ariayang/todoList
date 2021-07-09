//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
// Load the full build.
var _ = require('lodash');
// var object = require('lodash/fp/object');


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

const defaultItems = [item1, item2, item3];

/* used already. can be commented out*/
// Item.deleteMany({name: "<-- Hit this to delete an item"}, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Delete items to DB successfully");
//   }
// });


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) { 
  let day = date.getDay();
  //const day = date.getDate();
  //const itemsToRender = [];
Item.find({}, function(err, foundItems){
  //console.log(foundItems);
  //console.log(typeof(foundItems));
  //foundItems.forEach(function(todo) {
    //itemsToRender.push(todo.name);
    if(err) {
      console.log(err);
    }
    if (!foundItems.length) {
      //console.log("foundItems.length === 0, to check how many times it got run"); //6 times, until it continued to insert.
      //after save operation, 20 times.

      Item.insertMany(defaultItems, function(err){
        //console.log("To count how many insertMany got run");
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted many items to DB successfully");
          res.redirect("/"); //Not to put outside the else, otherwise, causing too many redirects.
        }
      });
      // const newList = new List({name: "homeList", items: defaultItems});
      // newList.save();
      //res.redirect("/"); //causeing 6 or more runs of checking foundItems.length
    } else {    
      res.render("list", { listTitle: "Today", newListItems: foundItems }); 
    }

  })
});
//need to have a views folder that contains the template file


// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "Work", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//     res.render("about", {listTitle: "About", newListItems: workItems});
// });

app.post("/", function (req, res) {
  // let item = req.body.newItem;
  //console.log(req.body);
  // if (req.body.list === "Work") {
  //     //console.log("within if" + req.body);
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   //console.log(item);
  //   items.push(item);
  //   res.redirect("/");
  // }

  //Below: Using database
  const itemName = req.body.newItem;
  const listName = req.body.list; //retriving input button name(list)'s value(listTitle)

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    //post to homepage
    item.save();
    res.redirect("/");
  } else {
    //post to custom list
    List.findOne({name: listName}, function(err, foundList) {
      //console.log("current listName in findOne when adding new item is " + listName);
      if (err) {console.log(err); }
      //console.log("foundList when adding new item is " + foundList); //output: null, because of earlier uppercase treatment
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

// My version below:
//   Item.create({name: itemName}, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Added one item to DB successfully");
//     res.redirect("/");
//   }
// });
});

app.post("/delete", function(req, res){

  //console.log(req.body.checkBox); //shows an id, once the checkbox get assigned an id
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted one item from DB successfully");
        res.redirect("/");
      } 
    });
  } else {
    //remove item from the custom list
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      function(err, foundList){
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    )
  }

});

// app.post("/work", function(req, res){
//     let item = req.body.newItem;
// });


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function (err, foundList){
    if (!err) {
      if (!foundList) {
        //Create a new list 
        //console.log(customListName + " does not exists");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        //res.render("list", {listTitle: list.name.toLocaleUpperCase(), newListItems: list.items});
        res.redirect("/" + customListName);
      } else {
        // Show the existing list 
        //console.log(foundList + " exist");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    } else {
      console.log(err);
    } 
  });

  /* My version: using List.find({}, callback), which returns an array
  List.find({}, function(err, foundLists){
    if (err) {
      console.log(err);
    } else {
      //Create new list if the first custom list
      if (foundLists.length === 0) {
        const newList = new List({name: customListName, items: defaultItems});
        newList.save();
      } 
      foundLists.forEach(function (listTitle){
          //if customListName in foundLists, then redirect to that page
          // else, create a new list with that name, then render the page
    
          if (customListName === listTitle.name) {
            console.log("found the list, redirecting...");
          } else {
            const newList = new List({name: customListName, items: defaultItems});
            newList.save();
          }
          res.render("list", { listTitle: customListName.toLocaleUpperCase(), newListItems: listTitle.items });
        }); 
    }
});*/

  // if (requestedTitle.includes(' ')) { 
  //   requestedTitle = requestedTitle.toLowerCase();
  //   requestedTitle = requestedTitle.split(' ').join('-'); 
  // }

});
     //console.log(foundItems); //[{_id: , name:, __v}, {}, ...]
  //   // TO check if another category of items, or those items have another property of a different category
  //   foundItems.forEach(function(toDoObject){

  //     if (postTitleLowerCase.includes(' ')) {
  //       postTitleLowerCase = postTitleLowerCase.split(' ').join('-');
  //   }
  //   });
  
  /* no need for this part
  app.post("/:customListName", function (req, res) {
    const itemName = req.body.newItem;
    //console.log("new item name is: " + itemName);

    List.find({}, function(err, foundLists){
      //console.log("The foundLists are: " + foundLists); // -> first time, empty
      if (err) {
        console.log(err);
      } else {
        foundLists.forEach(function (listTitle){
            //if customListName in foundLists, then redirect to that page
            // else, create a new list with that name, then render the page
          //console.log("Current found listTitle is: " + listTitle.name);     
            if (customListName === listTitle.name) {
              console.log("found the list, adding item ...");

              const item = new Item({name: itemName});
              customListName.items.push(item);


            } else {
              const newList = new List({name: customListName, items: defaultItems});
              newList.save();
            }
            res.render("list", { listTitle: customListName.toLocaleUpperCase(), newListItems: listTitle.items });
          }); 
      }
  });
  });
  */

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});

//mongoose.connection.close()