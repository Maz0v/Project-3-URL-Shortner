const BookModel = require('../models/bookModel');
const isUrlValid = require('url-validation')
const shortid = require('shortid');
const baseUrl = 'http://localhost:3000'
//-----------------------------redis for cache--------------------------------------------------------
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  17647,
  "redis-17647.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("QsltswDsKsJOS9xJHPyXM1b0YWGgOy9U", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//------------------------first api to generate url code-------------------------------------------------

    const createBooks= async function (req, res) {
        var data= req.body
        let savedData= await BookModel.create(data)
        res.send({msg: savedData})    
    }


//---------------------------second api to redirect--------------------------------------------------

const getBooks=async function(req,res){
    try{
    const bookId=req.params.bookId

   
    //finding longUrl in cache through urlCode
    let cachedbookData=await GET_ASYNC(`${bookId}`)
    
    if(cachedbookData){
        let arr=[0]
    for(let i=0;i<arr.length;i++){
        arr[i]++
        console.log(arr)
        if(arr[i]<5){
        const parsedbook=JSON.parse(cachedbookData)
        arr[i]=0
       return res.status(200).send(parsedbook)
       }
       else{
        return res.status(404).send({status:false, msg:"time limit exceeds"})
       }
      
    }
}
    else{
        const bookFound=await BookModel.findOne({_id:bookId})
        if (!bookFound) {
            // return a not found 404 status
            return res.status(404).send({status:false, msg:"No book Found"})
            } 
        else {
            // when valid we perform a redirect
            res.status(200).send(bookFound)
            //setting or storing data  in cache
            await SET_ASYNC(`${bookId}`, JSON.stringify(bookFound))
            return
            }
        }
       
    }
    
catch(err){
    return res.status(500).send({status:false, msg:err.message})
}
}



module.exports.createBooks=createBooks
module.exports.getBooks=getBooks





















