const express = require('express')
const app = express();
const process= require('node:process');
const instanceId = Math.random().toString(36).substring(2, 10);
console.log("App instance ID:", instanceId);

app.get("/test",(req,res)=>{
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(`Your Porcess Id : ${instanceId}`)
})

const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log("Server is running on PORT : ",PORT)
})