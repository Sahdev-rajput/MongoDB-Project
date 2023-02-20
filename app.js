//jshint esversion:6
//require various packages
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require("lodash");


//developing schemas and setting up the mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://Sahdev-admin:mongodb@cluster0.qgbhrqg.mongodb.net/TodolistDB");
mongoose.set('strictQuery', true);
const itemsschema = {
  name: String,
}
const Item = new mongoose.model("item", itemsschema);
const Item1 = new Item({
  name: "Buy Food",
}
);
const Item2 = new Item({
  name: "Eat Food",
});
const Item3 = new Item({
  name: "Drink 1 lite of  water",
});
const DynamicSchema=new mongoose.Schema({
  name:String,
  category:[itemsschema],
})
const Dynamic=mongoose.model("list",DynamicSchema);
var defaultArray = [Item1, Item2, Item3];


//to use express various functionalities
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {

  const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultArray, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Items saved into the database");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
    //console.log(foundItems);

  })

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;

  
  const Itema=new Item({
    name:itemName,
  });
  if(listName===date.getDate())
  {
  Itema.save();
  res.redirect("/");
  }
  else
  {
    Dynamic.findOne({name:listName},function(err,results)
    {
       results.category.push(Itema);
       results.save();
       res.redirect("/"+listName);
    })
  }
});

//express route parameters 
app.get("/:customListname",function(req,res)
{
  const customListName=_.capitalize(req.params.customListname);
  
  Dynamic.findOne({name:customListName},function(err,results)
  {
    if(!err)
    {
      if(!results)
      {
        const listitem=new Dynamic({
          name:customListName,
          category:defaultArray,
        })
        listitem.save();
        res.redirect("/"+customListName);
      }
      else
      {
        res.render("list", { listTitle: results.name, newListItems: results.category });
      }
    }
  })
  
})















app.post("/delete",function(req,res)
{
  const elementtoremove=req.body.checkbox;
  const listitemtoremove=req.body.listName;


  if(listitemtoremove==date.getDate())
  {
  Item.findByIdAndRemove(elementtoremove,function(err)
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("Successfully removed");
    }
  })
  res.redirect("/");
}
else
{
  Dynamic.findOneAndUpdate({name:listitemtoremove},{$pull:{category:{_id:elementtoremove}}},function(err,results)
  {
    if(!err)
    {
         res.redirect("/"+listitemtoremove);
    }
  })
}
  //console.log(req.body.checkbox);
})




  app.listen(process.env.port || 3000, function () {
    console.log("Server started on port 3000");
  });

