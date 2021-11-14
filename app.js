//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-rafy:tHkuGHdSKnEidlBl@cluster0.yawum.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
// mongoose.connect("mongodb://localhost:27017/todolistDB");
// mongodb+srv://admin-rafy:tHkuGHdSKnEidlBl@cluster0.yawum.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// ITEM SCHEMA

const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item", itemsSchema);

// LIST SCHEMA 

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("list", listSchema);

// default items
const item1 = new Item({name: "Welcome to do your todo List!"})
const item2 = new Item({name: "hit the + button!"})
const item3 = new Item({name: "<-- hit"})

const defaultItems = [item1, item2, item3];




// mongoose find()
app.get("/", function(req, res) {
  //{} -> 모두 찾기, foundItems
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err) {
          console.log(err);
        }else{
          console.log("Successfully saved default items to DB.")
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});  
    }
  });
  
});

//// Post + Save items (어디로?) 347

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    // name: itemName
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    //Look for list matching listName
    List.findOne({name: listName}, function(err, foundList){
      //push the new item to the list that matches listName
      foundList.items.push(item); 
      foundList.save();
      //redirect to the custom page
      res.redirect("/" + listName);
    });
  }
});


//// Delete - 345
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("task has been done.")
      res.redirect("/");
    }
  });
});

//// Route Parameter 로 custom List 만들기 - 346

app.get ("/:customListName", function(req, res){
  const customList = req.params.customListName;
  
  List.findOne({name:customList}, function(err, foundList ){    
    if(!err){
      if(!foundList){ //if foundlist doesn't exist!! !로 존재 유무를 확인
        //Create a new List
        const list = new List({
          name: customList, // 구분을 위해 강의와 다르게 표시 
          items: defaultItems
        }); 
        list.save();
        res.redirect("/"+customList);
      } else {
        //Show an existing list (이미 존재하므로 -> 추가 생성 방지.)
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  

  
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

// app.listen(3000, function() {
  //PORT = dynamic 자동으로 알아서 할당할수 있게 해주는듯.
app.listen(process.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
