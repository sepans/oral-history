    
    var dataFile= require('./data/data.js');
    
    //console.log(dataFile.videoInfo);
    
    /* server */
    var express = require('express')
      , app = express.createServer()
      , mongoose = require('mongoose');

    /* models */
    app.enable("jsonp callback");

    var mongodb_url = 'mongodb://127.0.0.1:27017/vidtest';
    mongoose.connect(mongodb_url);

    var Schema = mongoose.Schema
      , ObjectId = Schema.ObjectID;

    var Hobby = new Schema({
        name            : { type: String, required: true, trim: true }
    });

    var Person = new Schema({
        first_name      : { type: String, required: true, trim: true }
      , last_name       : { type: String, required: true, trim: true }
      , username        : { type: String, required: true, trim: true }
      , hobbies         : [Hobby]
      , shoe_size       : Number
      , eye_color       : String
    });
    
    
    var Video = new Schema({
        title      : { type: String, required: true, trim: true }
      , vimeo_url       : { type: String,  trim: true }
      , url       : { type: String,  trim: true }
      , thumbmail       : { type: String, trim: true }
      , events : [Event]
    });
    
    var Event = new Schema({
         timestamp   : Number
       , duration    : Number
       , related_objects : [RelatedObject]
    
    });

    var RelatedObject = new Schema({
          type    : { type: String, required: true, trim: true }
        , seek_point : Number
        , relatedness: Number
    
    });
    


    var Person = mongoose.model('Person', Person);

    var Video = mongoose.model('Video', Video);


    app.get('/', function(req,res){
        Video.find({}, function(error, data){
            res.json(data);
        });
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

    app.get('/adduser/:first/:last/:username', function(req, res){
        var person_data = {
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
    });

    app.get('/addhobby/:username/:hobby', function(req, res){
        Person.findOne({ username: req.params.username }, function(error, person){
            if(error){
                res.json(error);
            }
            else if(person == null){
                res.json('no such user!')
            }
            else{
                person.hobbies.push({ name: req.params.hobby });
                person.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    else{
                        res.json(data);
                    }
                });
            }
        });
    });

    app.listen(8080);
    console.log("listening on port %d", app.address().port);
