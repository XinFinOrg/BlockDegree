var twit = require("twit");
var ipfsClient = require("ipfs-http-client");
var puppeteer = require("puppeteer") ;
var fs = require("fs");

require("dotenv").config();

const xinfinClient = new ipfsClient({
    host: "ipfs.xinfin.network",
    port: 443,
    protocol: "https"
  });
  
const localClient = new ipfsClient("/ip4/127.0.0.1/tcp/5001");

exports.postTwitter = (req,res) => {
    console.log("called share twitter")
    console.log(req.user)
    var config = getTwitterConfig(process.env.TWITTER_CLIENT_ID,process.env.TWITTER_CLIENT_SECRET,req.body.token,req.body.tokenSecret);
    console.log(config)
    var T = new twit(config);
    var imgHTML = "";
    var imgBase64 = "";
      localClient.get(req.body.hash,(err,files) => {
          if (err){
              res.json({uploaded:false,error:err})
          }
        files.forEach(async (file) => {
            var localPath = "tmp/"+file.path+".png";
            imgHTML = file.content.toString('utf-8')
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.setViewport({
                width: 960,
                height: 760,
                deviceScaleFactor: 1,
              });            
            await page.setContent(imgHTML)
            await page.screenshot({path: localPath})
            browser.close().then(() => {
                var b64content = fs.readFileSync(localPath, { encoding: 'base64' });
                // User should be able to set the status for post
                T.post('media/upload', { media_data: b64content }, function (err, data, response) {
                    if (err){
                      console.log('ERROR:');
                      console.log(err);
                    }
                    else{                          
                      T.post('statuses/update', {
                        status: "Hey, I just got certified in blockchain from Blockdegree.org !!",
                        media_ids: new Array(data.media_id_string)
                      },
                        function(err, data, response) {
                          if (err){
                            console.log('ERROR: ',err);
                          }
                          else{
                            console.log('Posted the status!');
                          }
                        }
                      );
                    }
                  });
                  fs.unlink(localPath,(err) => {
                      if (err!=null){
                          console.log("Error while deleting te temp-file at: ",localPath)
                          res.json({uploaded:true,error:null})
                      }
                  })
            }) 
        })
      })

      
}

exports.shareFacebook = (req,res) => {

}

exports.shareLinkedin = (req,res) => {

}

function getTwitterConfig(consumerKey,consumerSecret,token,tokenSecret) {
    return {
        consumer_key : consumerKey,
        consumer_secret : consumerSecret,
        access_token : token,
        access_token_secret : tokenSecret  
    }
}