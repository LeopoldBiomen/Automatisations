async function sleep(time){
    return await new Promise((res, rej)=>{setTimeout(()=>res(), time)});
}


module.exports = {sleep};