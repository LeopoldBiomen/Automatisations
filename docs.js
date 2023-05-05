
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
var Stream= require('stream');

const { google } = require('googleapis');
const {authenticate} = require('@google-cloud/local-auth');
const dotenv = require("dotenv");
dotenv.config();

let fileId = process.env.USERS_FILE_LIST;
const SCOPES = ['https://www.googleapis.com/auth/drive'];


/*
permet de convertir un string en stream
*/
class ReadableString extends Stream.Readable {
 
  
    constructor( str) {
      super();
      this.str = str;
      this.sent = false;
    }
  
    _read() {
      if (!this.sent) {
        this.push(Buffer.from(this.str));
        this.sent = true
      }
      else {
        this.push(null)
      }
    }
  }


  class Drive{
    constructor(fileId){
        this.setFile(fileId)
    }

    setFile(id){
        this.fileId=id;
        return this;
    }
    

    async init(){
        this.drive = await getAccountDriveService();
        return this;
    }

    async createDocs(text, name="file"){
        const s = new ReadableString(text);
        return await this.drive.files.create(
            {   
                fields: '*',
                media: {
                    mimeType: 'text/plain',
                    body: s,
                },
                requestBody: {
                    name: name,
                    mimeType: 'text/plain',
                    //file needs to be shared with service account address
                    parents: ["1_mXuE8rYXHsLcZ0J3WYaygI7q6qBYx3a"],
                }}
                );
    }

    async readDocs(){
        const { data: prevContent } = await this.drive.files.export({
            fileId: this.fileId,
            mimeType: 'text/plain',
          });
     
        return prevContent;
    }

    async updateDocs(content){
        const media = {
            mimeType: 'text/plain',
            body: content,
          };
          
          return await this.drive.files.update({
            fileId: this.fileId,
            media,
          });
    }

    async setPermission(role, email){
       return  await this.drive.permissions.create({
            fileId: this.fileId,
            sendNotificationEmail: false,
            requestBody: {
            role: role,
            type: 'user',
            emailAddress: email
            },
        });
    }

    async createFolder(name){
        return await this.drive.files.create(
            {   
                fields: '*',
           
              requestBody: {
                name: name,
                mimeType: 'application/vnd.google-apps.folder',
                //file needs to be shared with service account address
                parents: ["1_mXuE8rYXHsLcZ0J3WYaygI7q6qBYx3a"],
              }}
        )
    }
  }



async function  getAccountDriveService(){
    const credentialFilename = path.join(__dirname, "serviceAccountCredentials.json");
  
    const auth = new google.auth.GoogleAuth({keyFile: credentialFilename, scopes: SCOPES});
    const drive = google.drive({ version: "v3", auth });

    return drive;
  
  }


 

  module.exports = {GGDrive : Drive}