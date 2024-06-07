let c = document.querySelector("#big-image")
document.querySelector("#a").addEventListener("click",()=>{
    let s = document.querySelector("#a").src
    c.setAttribute("src",s);
})
document.querySelector("#b").addEventListener("click",()=>{
    let s = document.querySelector("#b").src
    c.setAttribute("src",s);
})
document.querySelector("#c").addEventListener("click",()=>{
    let s = document.querySelector("#c").src
    c.setAttribute("src",s);
})
document.querySelector("#d").addEventListener("click",()=>{
    let s = document.querySelector("#d").src
    c.setAttribute("src",s);
})