let { chromium, devices, defineConfig } = require('@playwright/test');
let {sleep} = require("./utils");

  

/*
permet de récupérer les informations nutritionnelles, le nom du produit ainsi que la marque correspondants à chaque EAN
*/
async function run(EANS=["994390203920"], headless=true){
  
      const browser = await chromium.launch({headless});
      const context = await browser.newContext();
      const page = await context.newPage();
    let pagesInfos = []
    while(EANS.length>0){
        try{
        let EAN = EANS[EANS.length-1];
        await page.goto("https://fr.openfoodfacts.org/produit/"+EAN);
        let infos = await page.evaluate(()=>{
            let t = {};
        try{
            let title = document.querySelector("h2.title-1").textContent;
            t = {...t, title}
        }catch(e){

        }
        try{
            let brand = document.querySelector("#field_brands").textContent;
            if(brand){
                brand = brand.replace(/\n/g, "").split(":");
                if(brand.length>0){
                    brand = brand[1].trim();
                }
            }
            t = {...t, brand}
        }catch(e){

        }
        try{
            let ingredients = document.querySelector("#panel_ingredients_content").textContent.includes("ajouter")?null:document.querySelector("#panel_ingredients_content").textContent.trim(); 
            ingredients = ingredients.replace(/\n/g, "");
            t = {...t, ingredients}
        }catch(e){

        }
        try{
            let nutrition = {};
            [...document.querySelectorAll("table tbody tr")].map(tr=>{let infos=tr.querySelectorAll("td"); nutrition[infos[0].textContent.trim()] = infos[1].textContent.replace(/\n/g, "").trim().replace(" ", "")});
            nutrition["Énergie"] = nutrition["Énergie"].substring(0, nutrition["Énergie"].length-1).replace("kj", " Kj ").replace("kcal", " Kcal").replace("(", "/ ")

            t = {...t, ...nutrition}
        }catch(e){

        }
        
        
            
            return t;
    
        })
        infos["EAN"] = EAN+"";
        pagesInfos.push(infos);
    }catch(er){
        console.log("can't find -> next")
    }
        EANS.pop();
        }
    await browser.close();
    return pagesInfos;
  }


  process.on("message", async(message) => {
    let pagesInfos = await run(message.EANS, message.headless);
    // send the results back to the parent process
    process.send(pagesInfos);
    // kill the child process
    process.exit();
})



//run("3760049231083", true);