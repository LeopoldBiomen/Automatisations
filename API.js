var express = require("express");
var cors = require("cors");
let XLSX = require('xlsx');
let openfoodfacts = require("./openfoodfacts");
let {getImages, getImagesWithOFF} = require("./image");
const childProcess = require('child_process');
const { makeCompletion, preview } = require("./chatGPT.js");
let dotenv = require("dotenv");
dotenv.config();
//const nodeCmd = require('node-cmd');
//test2

var app = express();


let a = process.argv.slice(2);
console.log(a);
console.log(a.length)
let arguments={};
for(let i=0; i<a.length-1; i+=2){
    let t={};
    t[a[i].replace(/-/g, "")]= a[i+1];
    arguments={...arguments, ...t};

}


app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(cors());
/*
Chaque requête reçue est ensuite traitée sur un autre thread
*/

/*
Route permettant d'accéder à l'automatisation "Catalogue.bio"
*/
app.post('/', async function (req, res) {
   console.log("request to /")
   console.log(req.body.EANS);
   if(req.body.EANS == undefined){
    res.json({message: "no EANS"});
    return;
   } 
   if(req.body.email == undefined){
    res.json({message: "no email"});
    return;
   } 
   const forked_child_process = childProcess.fork('./catalogue.js');
   // send message to the child process
   forked_child_process.send({EANS:req.body.EANS, name: req.body.name, email: req.body.email, headless: true});
   // listen for a response from the child process
   forked_child_process.on("message", id => res.json({data: id, message: "everything is ok"}));
   
 })


 /*
Route permettant d'accéder à l'automatisation "OpenFoodFact"
*/
 app.post('/openfoodfacts', async function (req, res) {
   console.log("request to /openfoodfacts")
   console.log(req.body.EANS);
   if(req.body.EANS == undefined){
    res.json({message: "no EANS"})
    return;
   }

   const forked_child_process = childProcess.fork('./openfoodfacts.js');
   // send message to the child process
   forked_child_process.send({EANS:req.body.EANS, headless: true});
   // listen for a response from the child process
   forked_child_process.on("message", infos => res.json({data: infos, message: "everything is ok"}));

  
 })

 
/*
Route permettant d'accéder à l'automatisation "Recherches d'images"
*/
 app.post('/images', async function (req, res) {
   console.log("request to /images")
   console.log(req.body.EANS);
   if(req.body.EANS == undefined){
    res.json({message: "no EANS"})
    return;
   }

   const forked_child_process = childProcess.fork('./image.js');
   // send message to the child process
   forked_child_process.send({EANS:req.body.EANS, headless: true});
   // listen for a response from the child process
   forked_child_process.on("message", infos => res.json({data: infos, message: "everything is ok"}));
  
 })


/*
Route permettant d'accéder à l'automatisation "Description longue"
*/
 app.post('/descriptionCompletion', async function (req, res) {
  console.log("request to /descriptionCompletion")
  console.log(req.body.theme, req.body.searchKeyWords);
  if(req.body.prompt == undefined){
     res.json({message: "no prompt"});
     return;
  }
  let response;
  
    const forked_child_process = childProcess.fork('./chatGPT.js');
   // send message to the child process
   forked_child_process.send({prompt: req.body.prompt, searchKeyWords: req.body.searchKeyWords});
   // listen for a response from the child process
   forked_child_process.on("message", infos => res.json({...infos}));

 
})


/*
Route obsolète permettant de retourner une prévue des résultats google
*/
app.post('/preview', async function (req, res) {
  console.log("request to  /preview");
  if(!!req.body.preview==false) res.send("no preview");
  const forked_child_process = childProcess.fork('./preview.js');
  // send message to the child process
  forked_child_process.send({preview: req.body.preview});
  
  // listen for a response from the child process
  forked_child_process.on("message", infos => {console.log("preview sent");return res.json({content: infos, message: "everything is ok"})});

  
})

/*
Route permettant de s'assurer que le serveur tourne
*/
 app.get('/', function (req, res) {
    
    res.send("hello");
 })


//nodeCmd.run('dir', (err, data, stderr) => console.log(data));
app.listen(process.env.PORT | arguments.p, () => {
 console.log("Server running on port "+process.env.PORT);
});


