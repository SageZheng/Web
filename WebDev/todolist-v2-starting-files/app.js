//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require ("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://sage:123456789zys@cluster0.hiwfe.mongodb.net/todolistDB", { useNewUrlParser: true });
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todalist1"
})
const item2 = new Item({
  name: "welcome to your todalist2"
})
const item3 = new Item({
  name: "welcome to your todalist3"
})
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
  Item.find({}, function (err, findItems) {
    if (findItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("successully saved")
        }
      });
      res.redirect("/")
    }

    res.render("list", { listTitle: "Today", newListItems: findItems });
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
 // console.log(listName);
  const item = new Item({
    name: itemName
  })
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundRes) {
      foundRes.items.push(item);
      foundRes.save();
      res.redirect("/" + listName);
    })
  }
})
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  //console.log(checkedItemId);
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("success");
      }
    })
    sleep(200);
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

app.get("/:customListName", function (req, res) {
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundRes) {
    if (!err) {
      //console.log(foundRes)
      if (!foundRes) {
        //creat new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      }
      else {
        res.render("list", { listTitle: foundRes.name, newListItems: foundRes.items });
      }
    }
  })

})
app.get("/about",function(req,res){
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
