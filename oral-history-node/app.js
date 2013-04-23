
/**
 * Module dependencies.
 */
 
var dataFile= require('./data/data.js');
 

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , extend = require('mongoose-schema-extend');


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
//  app.use(require('connect').bodyParser());
  app.use(express.methodOverride());

 app.use('/img',express.static(path.join(__dirname, 'public/images')));
 app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));
 app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));
 //app.enable("jsonp callback");

  app.use(app.router);
 
});



//app.engine('html', require('jade').__express);
// for enabling raw html rendering
app.engine('html', require('ejs').renderFile);

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/', routes.index);

/*
app.get('/', function(req, res) {

    res.render('index.html');
});
*/
    var mongodb_url = 'mongodb://127.0.0.1:27017/vidtest';
    mongoose.connect(mongodb_url);

    var Schema = mongoose.Schema
      , ObjectId = Schema.ObjectID;

    var VideoSchema = new Schema({
        title      : { type: String, required: true, trim: true }
      , vimeo_url       : { type: String,  trim: true }
      , url       : { type: String,  trim: true }
      , thumbmail       : { type: String, trim: true }
      , events : [{
                     timestamp   : Number
                   , duration    : Number
                   , related_objects : [RelatedObject]
                  }]
    });
    
 /*
    var EventSchema = new Schema({
         timestamp   : Number
       , duration    : Number
       , related_objects : [RelatedObject]
    
    });
*/
    var RelatedObjectSchema = new Schema({
        tags: [String]
    
    }, {discriminatorKey : '_type' });
    
    var TranscriptSchema = RelatedObjectSchema.extend({
        text:   {type: String, trim: true}
    });

    var RelatedVideoSchema = RelatedObjectSchema.extend({
        video_id:   {type: String, trim: true}
        , seek_point : Number
        , relatedness: Number
    });
    
    

    var Video = mongoose.model('Video', VideoSchema);
/*
    var Event = mongoose.model('Event', VideoSchema);
*/
    var RelatedObject = mongoose.model('RelatedObject', RelatedObjectSchema);
    var Transcript = mongoose.model('Transcript', TranscriptSchema);
    var RelatedVideo = mongoose.model('RelatedVideo', RelatedVideoSchema);


    app.get('/', function(req,res){
       /* Video.find({}, function(error, data){
            res.json(data);
        });
        
        */
         res.render('index.html');
    });
    /*
    app.get('/getAllVideoInfo', function(req,res){
        Video.find({}, function(error, data){
            res.json(data);
        });
    });
    */
    
     app.get('/getAllVideoInfo', function(req,res){
        Video.find({}, function(error, data){
      	      var jsonp = { 'videoInfo' : data};
	      res.json(jsonp);
        });
    });
    
    
    app.get('/addvideo/:title/:vimeo_url', function(req, res){
        var video_data = {
            title: req.params.title
           ,vimeo_url: req.params.vimeo_url
        };

        var video = new Video(video_data);

        video.save( function(error, data){
            if(error){
                res.json(error);
            }
            else{
                res.json(data);
            }
        });
    });

    app.get('/addallvideos', function(req, res){
        //console.log(dataFile.videoInfo);
        var mongodbz = require('mongodb');
        var serverz = new mongodbz.Server("127.0.0.1", 27017, {safe:true});
        new mongodbz.Db('vidtest', serverz, {safe:true}).open(function (error, client) {
              if (error) throw error;
              var collection = new mongodbz.Collection(client, 'video');
              for(videoId in dataFile.videoInfo) {
                    var videoData = dataFile.videoInfo[videoId];
                    var video = new Video(videoData);
                    console.log(video);
                    video.save( function(error, data){
                        if(error){
                            res.json(error);
                        }
                        else{
                            res.json(data);
                        }
                    });
               /*   collection.insert(video, {},
                        function(err, objects) {
                            if (err) console.warn(err.message);
                            if (err && err.message.indexOf('E11000 ') !== -1) {
                              // this _id was already inserted in the database
                        }
                  });*/
                
            }
        });
       // res.json("done");
    });
    
    
   app.post('/addcomment', function(req, res){
       console.log('req '+req);
       console.log('body '+req.body);
       console.log('vid '+req.body['vid_id']);
       console.log('start '+req.body['start-time']);
       console.log('end '+req.body['end-time']);
       console.log('text '+req.body['text']);
       console.log('event-type '+req.body['event-type']);
       
     Video.findOne({'id':req.body['vid_id']}, function(error, video){
              if (error) return handleError(error);

              //var video = videos[0];  
                         
              console.log('--- vid ');
              console.log(video);

      	  /*    console.log('video title '+video.title);
      	      console.log('video events '+video.events);
      	      console.log('video events '+video['events']);
*/

      	     // var event = new Event({timestamp:req.body['start-time'], duration : req.body['end-time']-req.body['start-time'] });
              var event = {timestamp:req.body['start-time'], duration : req.body['end-time']-req.body['start-time']};//,related_objects: [{text:req.body['text']} ] };
      	      console.log('--- event '+event);
      	      
      	      //done inline
      	      
      	      var transcript= new Transcript({text:req.body['text']} );
      	      console.log('trans '+transcript);
      	      //transcript.text = req.body['text'];
      	      
      	      var rel = new Array();
      	      rel.push(transcript);
      	      event.related_objects = rel; 
      	      
      	      
      	      video.events.push(event);
      	      
      	      console.log('---- vid with new event ');
      	      console.log(video);
      	      
      	      video.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    else{
      	                console.log('---- data ');
              	        console.log(data);
                        res.json(data);
                    }
            });
        });


     /*   var person_data = {
     
            first_name: req.params.first
          , last_name: req.params.last
          , username: req.params.username
        };

        var person = new Person(person_data);

        person.save( function(error, data){
            if(error){
                res.json(error);
            }
            else{
                res.json(data);
            }
        });
        */
    });


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
