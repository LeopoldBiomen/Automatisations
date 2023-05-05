let { chromium, devices, defineConfig } = require('@playwright/test');
let writeXlsxFile = require('write-excel-file');
let {writeXLSX} = require("./writeXLSX.js");
let {saveToDrive} = require("./saveToDrive.js");
const fs = require('fs');
require("dotenv").config();

let data = [];
let clickTimeout = { timeout: 3000000 }

async function sleep(time){
  return await new Promise((res, rej)=>{setTimeout(()=>res(), time)});
}

/*
permet de récupérer 10 images au format .jpeg et encodée en base64 depuis OpenFoodFacts Google image 
*/
async function run(EANS=["3770009690256","3380390410403","3380390410304"], headless=true){

    const browser = await chromium.launch({headless});
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://www.google.com");
    if(await page.locator(".QS5gu.sy4vM").count() > 0) await page.click(".QS5gu.sy4vM")
    
    let t={};
    let infos = {};
    
    while(EANS.length>0){
        let EAN = EANS[0];
        if(EAN[0] != ""){
            try{
            await page.goto("https://fr.openfoodfacts.org/produit/"+EAN, {timeout: 300000});
            if(await page.locator("text='Tout accepter'").count() > 0) await page.click("text='Tout accepter'")
            
            infos = await page.evaluate(async()=>{
                let t = {};
            try{
                let title = document.querySelector("h2.title-1").textContent;
                t = {...t, title}
            }catch(e){
    
            }
            try{
                let brand = document.querySelector("#field_brands").textContent;
                t = {...t, brand}
            }catch(e){
    
            }
            try{
                let src;
                let base;
                let img = document.querySelector("#og_image");
                if(img != undefined){
                    src = img.src
    
                    const toDataURL = async(url) => await fetch(url)
                        .then(response => response.blob())
                        .then(blob => new Promise((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onloadend = () => resolve(reader.result)
                            reader.onerror = reject
                            reader.readAsDataURL(blob)
                        }))
    
                        base = await toDataURL(img.src);
                        //await new Promise((res, rej)=>setTimeout(()=>{res()}, 2000))
    
                }
                t = {...t, img: base}
            }catch(e){
                console.log("no image ", e)
            }
            return t;
            });
            }catch(navErr){
                console.log(navErr);
            }
        }
        
        try{
        //if(infos.title != undefined){
       //     await page.goto("https://www.google.com/search?q="+infos.title+"-"+EAN+"&tbm=isch&tbs=isz:l");
       // }else{
            await page.goto("https://www.google.com/search?q="+EAN+"&source=lnms&tbm=isch");
        //}
        
        await new Promise((res, rej)=>{setTimeout(()=>{res()}, 2000)});
        if(await page.locator(".QS5gu.sy4vM").count() > 0) await page.click(".QS5gu.sy4vM")
        let images = await page.evaluate(()=>{
            return [...document.querySelectorAll("img.rg_i.Q4LuWd")].slice(0, 5).map(e=>e.src);
        })

        if(infos.title != undefined){
            await page.goto("https://www.google.com/search?q="+infos.title+"&tbm=isch&tbs=isz:l");
            await new Promise((res, rej)=>{setTimeout(()=>{res()}, 2000)});
            if(await page.locator(".QS5gu.sy4vM").count() > 0) await page.click(".QS5gu.sy4vM")
            images = [...images,...(await page.evaluate(()=>{
                return [...document.querySelectorAll("img.rg_i.Q4LuWd")].slice(0, 5).map(e=>e.src);
            }))];
        }


        for(let i=0; i<images.length; i++){
            
            const buffer = Buffer.from(images[i].split(",")[1], "base64");
            //fs.writeFileSync(EAN+"_"+i+".jpg", buffer);
        }
        t[EAN] = [[infos.img], ...images];
        console.log(t)
        
        }catch(er){
            console.log(er);
        }

        EANS.shift();
        
    }
   
    await browser.close();
    return t;
    
}

/*
version alternative et obsolète de run
*/
async function run2(EANS=[["3770009690256", "GRAINE DE SENS"],["3380390410403", "PRIMEAL"],["3380390410304", "PRIMEAL"]], headless=true){
    
    const browser = await chromium.launch({headless});
    const context = await browser.newContext();
    const page = await context.newPage();
  let t = {};
  let infos;
  while(EANS.length>0){
      let EAN = EANS[0];
      t[EAN[0]]=[];
      if(EAN[0] != ""){
        await page.goto("https://fr.openfoodfacts.org/produit/"+EAN[0], {timeout: 300000});
        if(await page.locator("text='Tout accepter'").count() > 0) await page.click("text='Tout accepter'")
        
        infos = await page.evaluate(async()=>{
            let t = {};
        try{
            let title = document.querySelector("h2.title-1").textContent;
            t = {...t, title}
        }catch(e){

        }
        try{
            let brand = document.querySelector("#field_brands").textContent;
            t = {...t, brand}
        }catch(e){

        }
        try{
            let src;
            let base;
            let img = document.querySelector("#og_image");
            if(img != undefined){
                src = img.src

                const toDataURL = async(url) => await fetch(url)
                    .then(response => response.blob())
                    .then(blob => new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onloadend = () => resolve(reader.result)
                        reader.onerror = reject
                        reader.readAsDataURL(blob)
                    }))

                    base = await toDataURL(img.src);
                    //await new Promise((res, rej)=>setTimeout(()=>{res()}, 2000))

            }
            t = {...t, img: base}
        }catch(e){

        }
        return t;
        });
    }
    console.log(infos)
    
    t[EAN[0]].push(infos.img);
    if(infos.title != undefined ){
        await page.goto("https://www.google.com/search?q="+EAN[1].toLowerCase()+" "+infos.title+"-"+EAN +"&tbm=isch&tbs=isz:l");
        
        if(await page.locator("text='Tout accepter'").count() > 0) await page.click("text='Tout accepter'")
        await new Promise((res, rej)=>{setTimeout(()=>{res()}, 2000)});
        let images = await page.evaluate(()=>{
            return [...document.querySelectorAll("img.rg_i.Q4LuWd")].slice(0, 10).map(e=>e.src);
        })

       
        t[EAN[0]] = [...t[EAN[0]], ...images];
     
        
    }else{
        await page.goto("https://www.google.com/search?q="+EAN+"&tbm=isch&tbs=isz:l");
        await new Promise((res, rej)=>{setTimeout(()=>{res()}, 2000)});
        if(await page.locator("text='Tout accepter'").count() > 0) await page.click("text='Tout accepter'")
        let images = await page.evaluate(()=>{
            return [...document.querySelectorAll("img.rg_i.Q4LuWd")].slice(0, 10).map(e=>e.src);
        })
       
        t[EAN[0]] = [...t[EAN[0]], ...images];
        
    }
    
    EANS.shift();
    }
    await browser.close();
    return t;
    
}




process.on("message", async(message) => {
    let pagesInfos = await run(message.EANS, message.headless);
    // send the results back to the parent process
    process.send(pagesInfos);
    // kill the child process
    process.exit();
})


