
const fs = require('fs').promises;;
let XLSX = require('xlsx');

/* load 'fs' for readFile and writeFile support */
var removeDuplicate=((worksheet)=> {

    var xlsxJson = XLSX.utils.sheet_to_json(worksheet);

    for (let i = 0; i < xlsxJson.length; i++) {
        for(let j=i+1;j<xlsxJson.length; j++) {
            if(xlsxJson[i]['TicketName']===xlsxJson[j]['TicketName'] 
                && xlsxJson[i]['Date']==xlsxJson[j]['Date'] 
                && xlsxJson[i]['In_Input']===xlsxJson[j]['In_Input']
                && xlsxJson[i]['In_Result']===xlsxJson[j]['In_Result']
                && xlsxJson[i]['Call_Api']===xlsxJson[j]['Call_Api']
                && xlsxJson[i]['Report Status']===xlsxJson[i]['Report Status']) {
                xlsxJson[j]=" "; // Mark row as duplicate
            }
            else if((xlsxJson[i]['TicketName']===xlsxJson[j]['TicketName']
            && xlsxJson[i]['Date']==xlsxJson[j]['Date']) 
            && (xlsxJson[i]['In_Input']===xlsxJson[j]['In_Input']
            || xlsxJson[i]['In_Result']===xlsxJson[j]['In_Result']
            || xlsxJson[i]['Call_Api']===xlsxJson[j]['Call_Api']
            || xlsxJson[i]['Report Status']===xlsxJson[i]['Report Status'])) {
                xlsxJson[i]=xlsxJson[j]
                xlsxJson[j]=" "; // Mark row as duplicate
            }
            else {
                continue;
            }
        }

    }

    // Filter out duplicate rows.
    xlsxJson = xlsxJson.filter(row => (row + "").trim());
    return xlsxJson;    
})



let run = ()=>{

let filename = "text2.xlsx";
fs.writeFile(filename,"", ()=>{});



// Sample data set
let data = [{
    EAN: 3770011009350
},
{
    EAN:3576560500009
}];
  

  

const sheetName = "Sheet1" // <-- Change to the actual sheet name.
const workbook = XLSX.readFile(filename);
const ws = workbook.Sheets[sheetName];
let sheetJson = removeDuplicate(ws);

workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
XLSX.writeFile(workbook, filename); 

}

function writeXLSX(name_, data){
    let filename = name_+".xlsx";
    fs.writeFile(filename,"", (e, a)=>{console.log(e, " ", a)});
    const sheetName = "Sheet1" // <-- Change to the actual sheet name.
    const workbook = XLSX.readFile(filename);
    const ws = workbook.Sheets[sheetName];
    let sheetJson = removeDuplicate(ws);

    workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
    XLSX.writeFile(workbook, filename);
    return filename; 
}

module.exports.writeXLSX = async function writeXLSX(name_, data){
    let filename = name_+".xlsx";
    await fs.writeFile(filename,"", (e, a)=>{console.log(e, " ", a)});
    const sheetName = "Sheet1" // <-- Change to the actual sheet name.
    const workbook = XLSX.readFile(filename);
    const ws = workbook.Sheets[sheetName];
    let sheetJson = removeDuplicate(ws);

    workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
    await XLSX.writeFile(workbook, filename);
    return filename; 
}