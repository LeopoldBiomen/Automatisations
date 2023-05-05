
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const process = require('process');

let XLSX = require('xlsx');
const stream = require('stream');
const {GGDrive} = require("./docs.js");
const { google } = require('googleapis');
const {authenticate} = require('@google-cloud/local-auth');
const dotenv = require("dotenv");
const { drive } = require('googleapis/build/src/apis/drive');
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive'];

//with service account
const getDriveService = () => {
    const KEYFILEPATH = './service.json';
    
  
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
    const driveService = google.drive({ version: 'v3', auth });
    return driveService;
  };




// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'service2.json');

async function loadSavedCredentialsIfExist() {
  try {
    //const content = await fsp.readFile(TOKEN_PATH);
    //const credentials = JSON.parse(content);
    const credentials = {type:process.env.type,
      client_id:process.env.client_id,
      client_secret:process.env.client_secret,
      refresh_token:process.env.refresh_token};
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}
async function saveCredentials(client) {
  const content = await fsp.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fsp.writeFile(TOKEN_PATH, payload);
}
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/*
code récupéré du tutorial https://developers.google.com/drive/api/quickstart/nodejs?hl=fr
*/
let getDriveService2 = async()=>{
    let authClient = await authorize();
    const drive = google.drive({version: 'v3', auth: authClient});
    return drive;
}


async function  getAccountDriveService(){
  const credentialFilename = path.join(__dirname, "serviceAccountCredentials.json");

  const auth = new google.auth.GoogleAuth({keyFile: credentialFilename, scopes: SCOPES});
  const drive = google.drive({ version: "v3", auth });
  return drive;

}


async function saveToDrive(name, email){
console.log("prod ", process.env.PROD)
const Drive = process.env.PROD=='false'?await getDriveService2():await getAccountDriveService();
let d = await (new GGDrive()).init();
d.setFile(process.env.USERS_FILE_LIST);
let w = (await d.readDocs()).trim();

let content = JSON.parse(w);
let user = content.users.filter(e=>e.EMAIL==email);
console.log(user[0].CATALOGUE_BIO);
if(user.length==0) return;

const {data} = await Drive.files.create({
    media: {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: fs.createReadStream('./'+name),
    },
    requestBody: {
      name: "data.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      //file needs to be shared with service account address
      parents: [process.env.PROD=="true"?user[0].CATALOGUE_BIO:process.env.FOLDER_ID],
    },
    fields: 'id,name',
  });


  if(process.env.PROD=="true"){
    d.setFile(data.id);
    d.setPermission("writer", email);
  }
 

 
  return data;
  
};



//saveToDrive("data.xlsx", "estelleprt.leopold@gmail.com");

module.exports = { saveToDrive }