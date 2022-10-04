'use strict';

const Hapi = require('@hapi/hapi');
const knex = require("./utils/database");
const users = require("./models/users");
const tickets = require("./models/tickets");
const theater = require("./models/theater");
const screen = require("./models/screens");
const schedule = require("./models/schedule");

const {generateToken,verifyToken} = require("./middleware/jwt");
//const { array } = require('joi');
const Joi = require('joi');
const screens = require('./models/screens');
const { createValidationError, QueryBuilder } = require('./models/users');
const {errorMessage,statusCode} = require('./constants')



const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route([
    {
        method:"POST",
        path:"/login",
        handler: async function(request,reply){
            try{
            const payload = request.payload;
            let data = await users.query().where('userName', payload.userName).where("password",payload.password).catch((err)=>{console.log(err)}); 
            let jwt =  await generateToken(data[0]);
            if(jwt){
            return {message:"success",token:jwt}
            }
            else{
                return reply.response({message:"Invalid Credentials"}).code(401)
            }
            }
            catch(err){
                
                return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
            }
        },
        options: {
            validate: {
                payload: Joi.object({
                    userName: Joi.string().min(1).max(140).required(),
                    password:Joi.string().min(1).max(140).required()
                })
            }
        }
    },{
        method:"POST",
        path:"/createTheater",
        handler: async function(request,reply){
           try{
          // Verify Token start
            let jwtdata =  await verifyToken(request.headers.token);
            //console.log(jwtdata)
            if(jwtdata == "error"){
                return {message:"Invalid Token"}
            }
            // Verify Token end
            
            if(jwtdata.data.accessLevel!=3){
                return{message:"Access Denied"}
            }
            
            console.log(request.payload)
            let data = await theater.query().insert({
            theaterName: request.payload.theaterName,
             admin : request.payload.admin
              }).catch((err)=>{return {err:err}});

              let data1 = await users.query().insert({
                userName:request.payload.admin,
                password: (Math.random()+1).toString(36).substring(7),
                accessLevel:2
              }).catch((err)=>{return {err:err}});

            return ({data:data,userCreds:data1})
           }catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
           }
            
        },
        options: {
            validate: {
                payload: Joi.object({
                    theaterName: Joi.string().min(1).max(140).required(),
                    admin: Joi.string().min(1).max(140).required()
                })
            }
        }
    },{
        method:"POST",
        path:"/createScreen",
        handler: async function(request,reply){
          try{ 
          // Verify Token start
            let jwtdata =  await verifyToken(request.headers.token);
            //console.log(jwtdata)
            if(jwtdata == "error"){
                return {message:"Invalid Token"}
            }
            // Verify Token end
            
            if(jwtdata.data.accessLevel!=3 && jwtdata.data.accessLevel!=2 ){
                return{message:"Access Denied"}
            }

            if(jwtdata.data.accessLevel!=3){
            console.log(jwtdata.data)
            let checkAdmin =await theater.query().where('theaterName', request.payload.theaterName).where("admin",jwtdata.data.username).catch((err)=>{return {err:err}});
            console.log(checkAdmin);
             if(checkAdmin.length==0){
                 return {message:"Access Denied"}
             }

            }
            console.log(request.payload)
            let data = await screen.query().insert({
            theaterName: request.payload.theaterName,
             screenName : request.payload.screenName,
             seats: request.payload.seats  
              }).catch((err)=>{console.log(err)});

            

            return ({data:data})
        }catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
           }
            
        },options: {
            validate: {
                payload: Joi.object({
                    theaterName: Joi.string().min(1).max(140).required(),
                    screenName: Joi.string().min(1).max(140).required(),
                    seats:Joi.number().integer().required()
                })
            }
        }
    },{
        method:"POST",
        path:"/createSchedule",
        handler: async function(request,reply){
           try{
          // Verify Token start
            let jwtdata =  await verifyToken(request.headers.token);
            //console.log(jwtdata)
            if(jwtdata == "error"){
                return {message:"Invalid Token"}
            }
            // Verify Token end
            
            if(jwtdata.data.accessLevel!=3 && jwtdata.data.accessLevel!=2 ){
                return{message:"Access Denied"}
            }

            if(jwtdata.data.accessLevel!=3){
            console.log(jwtdata.data)
            let checkAdmin =await theater.query().where('theaterName', request.payload.theaterName).where("admin",jwtdata.data.username).catch((err)=>{return {err:err}});
            console.log(checkAdmin);
             if(checkAdmin.length==0){
                 return {message:"Access Denied"}
             }

            }

            let checkschedule = await schedule.query().where("timeFrom","<=",request.payload.TimeFrom).where("timeTo",">=",request.payload.TimeTo)
                                                      .where("timeFrom","<=",request.payload.TimeFrom).where("timeTo",">=",request.payload.TimeTo)
                                                      .where("movieDate",request.payload.movieDate)
                                                      .where("theaterName",request.payload.theaterName)
                                                      .where("screenName",request.payload.screenName)

            console.log(checkschedule);
            if(checkschedule.length>0){
                return "Screen Blocked"
            }
            console.log(request.payload)
            let data = await schedule.query().insert({
            theaterName: request.payload.theaterName,
             screenName : request.payload.screenName,
             movieName:request.payload.movieName,
             movieDate:request.payload.movieDate,
             timeFrom:request.payload.TimeFrom,
             timeTo: request.payload.TimeTo 
              }).catch((err)=>{console.log(err)});
            console.log(data)
            let screens = await screen.query().where("theaterName",request.payload.theaterName)
                                               .where("screenName",request.payload.screenName)
                                               .catch((err)=>{console.log(err);return "Screen / Theater doesnot exist"})
            console.log(screens[0].seats)

            let data1 =[];

            for(let i=1;i<=screens[0].seats;i++){
            data1.push({
            scheduleId: data.id,
            theaterName:request.payload.theaterName,
            screenName:request.payload.screenName,
            movieName:request.payload.movieName,
            movieDate:request.payload.movieDate,
            
            seatNo: i,
            bookingStatus: "Available",
            timeFrom:request.payload.TimeFrom,
            timeTo:request.payload.TimeFrom
            

            })
          
            }
            
            console.log(data1);
            data1 = await tickets.query().insertGraph(data1).catch((err)=>{console.log(err)})

            return reply.response({data:data}).code(200);
            
        }
        catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
        }
            
        },options: {
            validate: {
                payload: Joi.object({
                    theaterName: Joi.string().min(1).max(140).required(),
                    screenName: Joi.string().min(1).max(140).required(),
                    movieName:Joi.string().min(1).max(140).required(),
                    movieDate:Joi.string().min(1).max(140).required(),
                    TimeFrom:Joi.string().min(1).max(140).required(),
                    TimeTo:Joi.string().min(1).max(140).required(),
                })
            }
        }
    
    },{
        method:"GET",
        path:"/showTheater",
        handler: async function(request,reply){
           try{
        
            let data = await theater.query();
            return ({data:data});
        }catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
           }
            
            
        }
        
    },{
        method:"POST",
        path:"/showScreen",
        handler: async function(request,reply){
           try{
          
            let data = await screens.query();
            return ({data:data});
            
        }catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
           }
        }
    },{
        method:"GET",
        path:"/showMovies",
        handler: async function(request,reply){
           try{
         
            var today = new Date();
var year = today.getFullYear();
var month = today.getMonth()+1;
var date = today.getDate();
var fulldate =year+"-"+month+"-"+date;

            let data = await schedule.query().distinct('movieName').where("movieDate",">=",fulldate).catch((err)=>{console.log(err)})
            
            return ({data:data});
        }catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
           }
            
        }
    }

    ,{
        method:"POST",
        path:"/showTickets",
        handler: async function(request,reply){
           try{
   

            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth()+1;
            var date = today.getDate();
            var fulldate =year+"-"+month+"-"+date;

            let data = await tickets.query().where("movieDate",">=",fulldate).catch((err)=>{console.log(err)});
            console.log(request.payload.movieName)
            

            data = await tickets.query().modify((QueryBuilder)=>{
                if(request.payload.movieName){
                    QueryBuilder.where("movieName",request.payload.movieName)
                }

                if(request.payload.theaterName){
                    QueryBuilder.where("theaterName",request.payload.theaterName)
                }

                if(request.payload.screenName){
                    QueryBuilder.where("theaterName",request.payload.screenName)
                }
            })

            
            return ({data:data});
        }catch(err){
            return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
           }
            
        },options: {
            validate: {
                payload: Joi.object({
                    theaterName: Joi.string().min(1).max(140).required(),
                 
                    movieName:Joi.string().min(1).max(140).required()
                })
            }
        }
    },{
        method:"POST",
        path:"/bookTickets",
        handler: async function(request,reply){
           try{
          // Verify Token start
             let jwtdata =  await verifyToken(request.headers.token);
             //console.log(jwtdata)
             if(jwtdata == "error"){
                 return {message:"Invalid Token"}
             }
            // Verify Token end
           // console.log(jwtdata.data)
            if(jwtdata.data.accessLevel!=1){
                return{message:"Access Denied"}
            }
         for(let i=0;i<request.payload.id.length;i++){
            let checkAvailability = await tickets.query().where("id",request.payload.id[i]);
            if(checkAvailability[0].bookingStatus != "Available"){
              return "Sorry soome of the seats are already taken"
            }
         };
         
            let data=[];
         for(let i=0;i<request.payload.id.length;i++){
             data.push (await tickets.query()
                .patch({ bookingStatus: 'booked' ,bookedUserId: jwtdata.data.id,bookedUserName: jwtdata.data.username})
                .where('id', '=', request.payload.id[i]).catch((err)=>{ console.log(err)})
            )
            
         };
        
        return {data:"Booked Successfully"}
    }catch(err){
        return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
       }
            
        },options: {
            validate: {
                payload: Joi.object({
                    id: Joi.array().items( Joi.number().required()).required()
                })
            }
        }
    },{
        method:"POST",
        path:"/cancelBookedTickets",
        handler: async function(request,reply){
        try{   
          // Verify Token start
             let jwtdata =  await verifyToken(request.headers.token);
             //console.log(jwtdata)
             if(jwtdata == "error"){
                 return {message:"Invalid Token"}
             }
            // Verify Token end
           // console.log(jwtdata.data)
            if(jwtdata.data.accessLevel!=1){
                return{message:"Access Denied"}
            }
         for(let i=0;i<request.payload.id.length;i++){
            let checkAvailability = await tickets.query().where("id",request.payload.id[i]);
            if(checkAvailability[0].bookingStatus != "booked"){
              return "Sorry soome of the seats are not booked"
            }
            if(checkAvailability[0].bookedUserId != jwtdata.data.id){
                return "Sorry, you are not authorized to cancel this ticket"
              }
         };
         
            let data=[];
         for(let i=0;i<request.payload.id.length;i++){
             data.push (await tickets.query()
                .patch({ bookingStatus: 'Available' ,bookedUserId: 0,bookedUserName: null})
                .where('id', '=', request.payload.id[i]).catch((err)=>{ console.log(err)})
            )
            
         };
        
        return {data:data}
    }catch(err){
        return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
       }
            
        }
        ,options: {
            validate: {
                payload: Joi.object({
                    id: Joi.array().items( Joi.number().required()).required()
                })
            }
        }
    },{
        method:"POST",
        path:"/bookedTickets",
        handler: async function(request,reply){
        try{   
          // Verify Token start
             let jwtdata =  await verifyToken(request.headers.token);
             //console.log(jwtdata)
             if(jwtdata == "error"){
                 return {message:"Invalid Token"}
             }
            // Verify Token end
           // console.log(jwtdata.data)
            if(jwtdata.data.accessLevel!=1){
                return{message:"Access Denied"}
            }
         
         
    let data = await tickets.query().where("bookedUserId",jwtdata.data.id)
        
        return {data:data}
    }catch(err){
        return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
       }
            
        }
    }
    ,{
        method:"POST",
        path:"/updateSchedule",
        handler: async function(request,reply){
           
          try{
          // Verify Token start
          let jwtdata =  await verifyToken(request.headers.token);

          if(jwtdata == "error"){
              return {message:"Invalid Token"}
          }
          // Verify Token end
       
          if(jwtdata.data.accessLevel!=3 && jwtdata.data.accessLevel!=2 ){
              return{message:"Access Denied"}
          }

          if(jwtdata.data.accessLevel!=3){
         
          let checkAdmin =await theater.query().where('theaterName', request.payload.theaterName).where("admin",jwtdata.data.username).catch((err)=>{return {err:err}});
       
           if(checkAdmin.length==0){
               return {message:"Access Denied"}
           }

          }
         
          let checkAvailabilitySeats = await tickets.query().where('scheduleId',request.payload.scheduleId).where("bookingStatus","booked");

          console.log({checkAvailability:checkAvailabilitySeats})

          let schedule1 = await schedule.query().where('id',request.payload.scheduleId);
          console.log({schedule:schedule1})
          console.log({scheduleLength : schedule1.length})
          console.log({checkAvailabilitySeats:checkAvailabilitySeats.length})
          if(schedule1.length!=0 && checkAvailabilitySeats.length==0){
        
           
          }else{
            return {error:"error"};
          }

          console.log(schedule1[0].movieDate)
          let checkSchedule = await schedule.query().where("movieDate",schedule1[0].movieDate)
                                                    .where("screenName",request.payload.newScreen)
                                                    .where("timeFrom","<=",schedule1[0].timeFrom).where("timeTo",">=",schedule1[0].TimeTo)
                                                    //.where("timeFrom","<=",schedule1[0].TimeTo).where("timeTo",">=",schedule1[0].timeFrom)

        

         console.log({checkSchedulelength:checkSchedule.length})

         let seatCheck = await screens.query().where("screenName",schedule1[0].screenName)
                                            
         let seatCheckNew = await screens.query().where("screenName",request.payload.newScreen)
       
console.log({seatCheck:seatCheck[0].seats,seatCheckNew: seatCheckNew[0].seats,checkScheduleLength:checkSchedule.length})

        let data;
         if(checkSchedule.length==0 && seatCheck[0].seats == seatCheckNew[0].seats){
            console.log("coming here")
        data = await schedule.query().update({"screenName":request.payload.newScreen}).where('id', request.payload.scheduleId);
         }else{
            return{error:"error"}
         }


     


        
        return {data:data}
    }catch(err){
        return reply.response({error:errorMessage['Internal Server Error']}).code(statusCode['Internal Server Error'])
       }
            
        },options: {
            validate: {
                payload: Joi.object({
                    scheduleId: Joi.number().integer().required(),
                    newScreen: Joi.string().min(1).max(140).required(),
                 
                })
            }
        }
    
    }


]);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();