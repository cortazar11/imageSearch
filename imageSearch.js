var https=require('https')
var bl=require("bl")
var express=require('express')

var app=express()

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


var arrayRecent=[]

app.get('/api/imagesearch/:topic',function(req,res){
        var topic=encodeURI(req.params.topic)
        var offset=req.query.offset
        console.log(topic)
        console.log(offset)

        var recent={"term":req.params.topic,
                "when":new Date().toJSON()}
        var length=arrayRecent.unshift(recent)
        if(length>10){
           arrayRecent.pop()
         }


         var opts = {
            host: 'www.googleapis.com',
            path: `/customsearch/v1?q=${topic}&cx=010883912489311344045%3Ahfo2o4xvqpi&start=${offset}&key=AIzaSyAEtJnyPhVBMio2F2-6zc8ZejjD8WYkE2o&fields=items(pagemap/cse_image(src),snippet,pagemap/cse_thumbnail(src),link)`,
            };

        https.get(opts,function(resp){
              resp.pipe(bl(function(err,data){
              if(err) throw err
              var myData=JSON.parse(data)
              var myArray=myData.items
              var result=[]

              myArray.forEach(function(element){
                  var link=element.link
                  var snippet=element.snippet
                  if(typeof element.pagemap=='object'){
                    var image=element.pagemap.cse_image
                    var thumbnail=element.pagemap.cse_thumbnail
                  }

                  result.push({"url":image,
                                "snippet":snippet,
                                "thumbnail":thumbnail,
                                "context":link})

              })

                res.end(JSON.stringify(result))


        }))

      })
})

app.get('/api/latest/imagesearch/',function(req,res){
      res.end(JSON.stringify(arrayRecent))
})



app.use(function (err, req, res, next) {

  res.status(500).send('Bad Request')
})
//listen for requests :)
var listener = app.listen(3000);
