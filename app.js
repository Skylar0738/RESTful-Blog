var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"), 
    mongoose    = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

//APP CONFIG
//mongoose.connect("mongodb://localhost/blogApp");
mongoose.connect("mongodb://zia:newyork01@ds163689.mlab.com:63689/blogapp");
app.set("view engine", "ejs"); //need this for all apps
app.use(express.static("public")); //need this for  custom ccs stylesheet 
app.use(bodyParser.urlencoded({extended: true})); //need this for all apps
app.use(expressSanitizer());//Sanitizer needs to go after body parser
app.use(methodOverride("_method"));


//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String, 
    body: String,
    created: {type:Date, default: Date.now()}
});

var b = mongoose.model("Blog", blogSchema);

//test to confirm the blog is connecting to the database
// b.create({
//     title:"Cat is in the house", 
//     image:"https://logos.textgiraffe.com/logos/logo-name/Habiba-designstyle-birthday-m.png", 
//     body:"Cat's are generally from hubli area. They tend bite show affection toward husband",
// });

//RESTFUL ROUTES

//index page will route to /blogs page
app.get("/",function(req, res) {
    res.redirect("/blogs");
});

//Index Route will list all of the blogs
app.get("/blogs", function(req, res){
    b.find({}, function(err, allBlogs){ //segment conencting with mongo db, whatever data comes is sent to else statement 
      if(err){
          console.log("error");
      }else{
          res.render("index",{bigBlog:allBlogs}) //whatever comes from line 38 
      }
    })
});

//New blog post route:: 
app.get("/blogs/new", function(req, res) {
    res.render("new")
})

//Create Blog Route::
app.post("/blogs", function(req, res){
    //create blog
    console.log("###############"); 
    console.log(req.body);
    console.log("###############"); 
    req.body.blog.body = req.sanitize(req.body.blog.body);// req body coming from express, blog.body coming from new.ejs
    console.log("=================="); 
    console.log(req.body); 
    console.log("=================="); 
    b.create(req.body.blog, function(err, newblog){
       if(err){
           res.render("new");
       }else{
       //then, redirect to the index page
           res.redirect("/blogs")}
   });
});

//Show Blog Route:
app.get("/blogs/:id", function(req, res) {
   //res.send("show page!"); 
   b.findById(req.params.id, function(err, foundBlog){
       if(err){res.redirect("/blogs")}
       else{res.render("show", {blogpost:foundBlog})};
   });
});

//Edit Route /dog/:id/edit - show the from 
app.get("/blogs/:id/edit", function(req, res) {
    //first we need find the blog that needs to be edited
    b.findById(req.params.id, function(err,editBlog){
        if(err){
            res.redirect("/blogs");
        }else{
           res.render("edit",{bl:editBlog});   
        }
    });
});


//Update Route
app.put("/blogs/:id", function(req, res){
    //res.send("UpdateRoute")
    //b.findByIdAndUpdate(id, newData, callback) - will find id and update at the same time 
    req.body.bl.body = req.sanitize(req.body.bl.body);// req body coming from express, blog.body coming from new.ejs
    b.findByIdAndUpdate(req.params.id, req.body.bl, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//Delete a particular blog
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    b.findByIdAndRemove(req.params.id, function(err){
    //redirect somewhere
       if(err){
           res.redirect("/blogs");
       } else{
           res.redirect("/blogs");
       }
    });
    //res.send("you have reda reache");
});









app.listen(process.env.PORT, process.env.ip, function(){
    console.log("Server is Running!");
});