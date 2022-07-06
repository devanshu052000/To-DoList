const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine','ejs');

mongoose.connect("mongodb+srv://admin-devanshu:9jtluuSySGDowBmU@cluster0.kjgcovs.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const arr = [
  {
    name: "Welcome to your todolist!"
  },
  {
    name: "Hit the + button to add a new item."
  },
  {
    name: "<-- Hit this to delete an item."
  }
];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){

  Item.find({}, function(err, foundItems){
    if(foundItems == 0)
    {
      Item.insertMany(arr, function(error, docs){});
      res.redirect("/");
    }else{
      res.render("list",{listTitle: "Today", newListItem: foundItems});
    }
  });
});

app.post("/", function(req,res){
  const newitem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: newitem });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({ name: listName }, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err)
      {
        console.log(err);
      }else{
        console.log("Item with id "+checkedItemId+" removed.");
      }
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: arr
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
      }
    }
  });



});

app.get("/about",function(req, res){
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function(){
  console.log("Server is running successfully")
})

// https://guarded-waters-72890.herokuapp.com/
