// jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://praveenkumar21bce8952:sgIQg2Rjbq9Cvn69@cluster0.7s6rbt8.mongodb.net/todolist?retryWrites=true&w=majority", { useNewUrlParser: true ,});

const itemSchema = {
  name: String
};  

const Item = mongoose.model("Item", itemSchema);

const defaultItems = [
  { name: "Praveen" },
  { name: "Madhu" },
  { name: "Manessha" }
];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

// Insert default items using promises
Item.insertMany(defaultItems)
  .then(() => {
    console.log("Default items inserted successfully.");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", function (req, res) {
  // Use promises to find items
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add a new route to handle custom lists
app.get("/:customListName", (req, res) => {
  const customListName =(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        return list.save();
      } else {
        // Show an existing list
        return foundList;
      }
    })
    .then(list => {
      res.render("list", { listTitle: list.name, newListItems: list.items });
    })
    .catch(err => {
      console.log(err);
    });
});

// Handle the form submission to add a new item to the database
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName })
      .then(foundList => {
        foundList.items.push(item);
        return foundList.save();
      })
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch(err => {
        console.log(err);
      });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName =req.body.listName;
  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemId)
  .then(()=>{
      console.log("successfully deleted checked item");
      res.redirect("/");
    })
    .catch((err)=>{console.log(err)});
  }
  else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
     .then(()=>{
      
      res.redirect("/" + listName);
    })
    .catch((err)=>{console.log(err)});
  }
  
  });

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3004, function () {
  console.log("Server started on port 3004");
});
