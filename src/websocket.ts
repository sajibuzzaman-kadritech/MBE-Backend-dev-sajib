// import { Server } from "socket.io";
import queryString from "query-string";
import MessageDAO from "./daos/message.dao";
import UserDAO from "./daos/user.dao";
import MessageDTO from "./dtos/message.dto";
import { v4 as uuidv4 } from 'uuid';
import HandledApplicationError from "./error/handled-application-error";
import config from "config";
import catchError from "./error/catch-error";

export default (expressServer:any) => {


  let messageDAO: MessageDAO = new MessageDAO();
  let userDAO: UserDAO = new UserDAO();


  var io = require('socket.io')(expressServer,{
    cors: {
        origin: '*',
        pingTimeout: 60000
    },
  });

  io.on('connection', (socket:any) => {
      // console.log("socket",socket)
      console.log(socket.conn.server.clientsCount);
      console.log('connected => ', socket.id);

      

      // all users seller and delivery boy join the room
      

      socket.on('disconnect', async () => {
          // const list = await getAllUsers();
          // console.log('list => ', list);

          // const index = list.findIndex(user => user.socketId === socket.id);
          // const user = list[index];
          console.log("disconnected");
          // if (index !== -1) {
          //     list.splice(index, 1)[0];
          //     removeUser(socket.id);
          //     const list_ = await getAllUsers();
          //     console.log('list_ => ', list_);
          // } else {
          //     console.log('user not found');
          // }

          // removeSocketUser(socket.id, (user, er) => {
          //     if (er) {
          //         console.log(er)
          //         return;
          //     }
          //     console.log('disconnect user' + user);
          //     io.to('drop_room').emit('drop_room_leaved', { user });
          //     console.log("disconnect user", socket.id)
          // });
      });

      let chatId : string = undefined;
    //   if(chatId){
    //     // console.log()
        // socket.on(chatId, (msg:any)=>{
        //     // socket.emit(chatId, msg);

        //     console.log('chatid ## '+chatId, msg);
        // })

    //     return;
    //   }
      socket.on('message', (msg:any, callback:any) => {
        console.log('onMessage', msg);
        //this is new order emmit on diffrent channel
        if(msg.type == 'neworder'){
          console.log("newordr#$$#$", msg);
          socket.broadcast.emit("new_order_done", msg);
          return;
        }

        (async()=>{
          try {
            const dto: MessageDTO = msg;
            //if admin send message then dont need the following code to un as admin is also posting to server's message endpoint
            if(msg.chatID !== undefined){
              socket.broadcast.emit("new_chat_arrived", {chat_id:msg.chatID, endofchat: msg.endofchat});
              return;
            }
            // const status = req.query.status;
            if (dto.senderId == '' && dto.receiverId == '') {
              throw new HandledApplicationError(401, 'sender Id is required');
            }
            
            const data = await messageDAO.getByFilter({$and: [
                { senderId: dto.senderId},
                { status: { $not: { $eq: "Completed" } } }
            ]});
  
  
            if (!data) {
              if(dto.senderId == '2'){
                dto.senderName = 'Admin';
                dto.senderImage = 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png';
                dto.senderEmail = 'admin@mbe.com';
              } else {
                const senderDetails = await userDAO.getById(dto.senderId);
                console.log('####senderDetails', senderDetails);
                dto.senderName = senderDetails.name ? senderDetails.name : "nai name";
                //if user has no image set default image
                dto.senderImage = senderDetails.profilePhoto ? senderDetails.profilePhoto : 'https://storage.googleapis.com/mbestbucket/dum_2022-08-23T203316.209Z_my.png';
                dto.senderEmail = senderDetails.email;

                console.log("senderDetails.profilePhoto", senderDetails.profilePhoto);
                // if (senderDetails.profilePhoto !== '' || senderDetails.profilePhoto.indexOf("googleusercontent") == -1) {
                //   const filenameL = senderDetails.profilePhoto.split('?')[0];
                //   const filename = filenameL.split('/')[filenameL.split('/').length - 1];
          
                //   const url = await readPreSignedUrl(filename);
                //   dto.senderImage = url;
          
                // }
              }
  
                if (dto.receiverId && dto.receiverId != '') {
                  //const recieiverDetails = await this.userDAO.getById(dto.receiverId);
                  dto.receiverName = 'Admin';//recieiverDetails.name;
                  // dto.receiverImage = 'dsfcsf';//recieiverDetails.profilePhoto;
                }
                //'https://storage.googleapis.com/mbebucket/dummy.png'
                
                // const uuidv4 = require('uuid/v4');

                const pdto: MessageDTO = dto;
                pdto.chat = [{user:{_id:dto.senderId,name:dto.senderName,avatar:dto.senderImage},'text':dto.chat[0].text,_id:uuidv4(),createdAt:new Date}];
                // this.SendNotificationWS('chat', 'New', 'broadcast', dto.senderId);
                console.log("dto.senderId", dto.senderId);
                console.log("pdto.senderImage", pdto.senderImage);
                //this.SendNotificationWS('chat', 'New', 'broadcast', dto.receiverId);
                const result = await messageDAO.create(pdto);
  
  
  
                (()=>{
                  var nodemailer = require('nodemailer');
                  // send  mail to admin
                  var transporter = nodemailer.createTransport({
                      service: 'gmail',
                      port:465,
                      secure: true,
                      auth: {
                          user: 'Social@multibrandselectronics.com',
                          pass: 'navqbqczsyqfpcky'
                      }
                  });
    
                  let emalhtml=`<!DOCTYPE html>
                      <html>
                      <head>
                          <meta name="viewport" content="width=device-width">
                          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                          <title>Welcome Email Template</title>
                      </head>
                      <body>
                          <p style="font-size: 14px; font-weight: normal;">Hi admin,</p>
                          <p style="font-size: 14px; font-weight: normal;">There is a new chat message by ${dto.senderName} (${dto.senderEmail}). Please go to admin panel.</p>
                          
                          <p><br><br><br><b>- This is an automated mail, do not reply.</p>
                      </body>
                      </html>`;
                      
                  var mailOptions = {
                      // from: 'subodhiat8@gmail.com',
                      from: 'Social@multibrandselectronics.com',
                      to: 'Hussein@multibrandselectronics.com',
                      subject: 'New Chat Message | MBE',
                      //text: `Passsword reset link ${variableAndValues[2].value}`,
                      html:emalhtml
                  };
                  transporter.sendMail(mailOptions, function(error:any, info:any){
                      if (error) {
                          console.log(error);
                      } else {
                          console.log('Email sent: ' + info.response);
                      }
                  });
                })();

                chatId = result._id.toString();
                msg.chatId = result._id.toString();


                console.log("msg#######senderImage",result);

  
              callback({chat_id: chatId});
              socket.broadcast.emit("new_chat_arrived", {chat_id: chatId});
              return;
            }
  
  
  
            console.log('has data');
            
            const chatDetails = data;
            let updateBody = { };
            chatId = chatDetails._id.toString();

            console.log('dto###',dto);
            // const uuidv4 = require('uuid/v4');
            
            // this.SendNotificationWS('chat', 'New', chatDetails._id, dto.senderId);
            chatDetails.chat.push({user:{_id:dto.senderId,name:chatDetails.senderName,avatar:chatDetails.senderImage},'text':dto.chat[0].text,_id:uuidv4(),createdAt:new Date});
            console.log("chatDetails.senderImage", chatDetails.senderImage);
            //chatDetails.chat.push({ msg: dto.usermsg, id: dto.senderId });
            updateBody = { chat: chatDetails.chat, updated: new Date };
  
            const rest = await messageDAO.updateC(chatDetails._id.toString(), updateBody);
  
            // res.json({ success: true, chatId: chatDetails._id.toString() });

            socket.broadcast.emit("new_chat_arrived", {chat_id: chatId});
          } catch (err) {
            console.error("Error", err);
          }
        })()

      });

    //   socket.on('join_user_and_admin_chat', (data:any) => {
    //       try {
    //           console.log(data);
    //           socket.join(data.room);
    //           socket.broadcast
    //               .to(data.room)
    //               .emit('join_user_and_admin_chat_received', data);
    //       } catch (error) {
    //           console.log(error);
    //       }
    //       // socket.broadcast.to(data.room).emit('join_bidding_chat', "message send to all in this room");
    //   });

    //   socket.on('join_user_and_admin_chat_send', (data:any) => {
    //       socket.broadcast
    //           .to(data.room)
    //           .emit('join_user_and_admin_chat_received', data);
    //   });
  });

  let readPreSignedUrl = async (fileName: string
    ) => {
      try {
        const { Storage } = require('@google-cloud/storage');

        // Creates a client
        const storage = new Storage(
          {
            projectId: config.get<string>('gcp.projectId'),
            keyFilename: 'for-poc-325210-a7e014fe2cab.json',
          }
        );
        const options = {
          version: 'v4',
          action: 'read',
          expires: Date.now() + 450 * 60 * 1000, // 15 minutes
        };
        const [url] = await storage
          .bucket(config.get<string>('gcp.bucket'))
          .file(fileName)
          .getSignedUrl(options);
        return url;
      } catch (err) {
        return '';
      }
    }

  return io;
  
};
// try{


//     let messageDAO: MessageDAO;
//     let userDAO: UserDAO;
  
//     const wss = new WebSocket.Server({
//       noServer: true,
//       path: "/websockets",
//     });
  
//     app.on("upgrade", (request:any, socket:any, head:any) => {
//       wss.handleUpgrade(request, socket, head, (websocket:any) => {
//         wss.emit("connection", websocket, request);
//       });
//     });
  
//     wss.on('connection', (ws: WebSocket) => {
  
//         ws.onmessage = (e)=>{
  
//           const dto: MessageDTO = JSON.parse(e.data);
//           // if (dto.senderId == '' && dto.receiverId == '') {
//           //   throw new HandledApplicationError(401, 'sender Id is required');
//           // }
  
//           console.log(dto);
  
//         //   async()=>{
//         //     const data = await messageDAO.getByFilter({ $or: [{ senderId: dto.senderId, status: 'New' }, { receiverId: dto.senderId, status: 'New' }] });
  
  
  
//         //     if (!data) {
//         //       if(dto.senderId == '2'){
//         //        dto.senderName = 'Admin';
//         //        dto.senderImage = 'https://storage.googleapis.com/mbebucket/dummy.png';
//         //        dto.senderEmail = 'admin@mbe.com';
//         //       } else {
//         //        const senderDetails = await userDAO.getById(dto.senderId);
//         //        dto.senderName = senderDetails.name;
//         //        dto.senderImage = senderDetails.profilePhoto;
//         //        dto.senderEmail = senderDetails.email;
               
//         //       }
  
//         //        if (dto.receiverId && dto.receiverId != '') {
//         //          //const recieiverDetails = await this.userDAO.getById(dto.receiverId);
//         //          dto.receiverName = 'Admin';//recieiverDetails.name;
//         //          dto.receiverImage = 'dsfcsf';//recieiverDetails.profilePhoto;
//         //        }
//         //        //'https://storage.googleapis.com/mbebucket/dummy.png'
               
//         //        const uuidv4 = require('uuid/v4');
//         //        const pdto: MessageDTO = dto;
//         //        pdto.chat = [{user:{_id:dto.senderId,name:dto.senderName,avatar:dto.senderImage},'text':dto.chat[0].text,_id:uuidv4(),createdAt:new Date}];
  
//         //        console.log("dto.senderId", dto.senderId);
//         //        //this.SendNotificationWS('chat', 'New', 'broadcast', dto.receiverId);
//         //        const result = await messageDAO.create(pdto);
  
  
//         //       ws.send(JSON.stringify({chatId: result._id.toString()}));
//         //     }
            
//         //     ws.send(JSON.stringify({chatId: data._id.toString()}));
  
  
  
  
  
//         //   }
  
//         //     //log the received message and send it back to the client
//         //     console.log('received: %s', message);
//         //     ws.send(`Hello, you sent -> ${message}`);
  
//         }
  
//         //send immediatly a feedback to the incoming connection    
//         ws.send('Hi there, I am a WebSocket server');
//     });
  
  
  
  
//   }catch(e){
//     console.log("Error",e);
//   }
  