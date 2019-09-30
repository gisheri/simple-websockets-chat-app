// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION }); 
var DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

function chunk(arr, chunkSize) {
  var chunked = [];
  for (var i=0,len=arr.length; i<len; i+=chunkSize)
    chunked.push(arr.slice(i,i+chunkSize));
  return chunked;
}

let deleteConnection = (connectionId)=>{
  var params = {
    TableName: process.env.CONNECTIONS_TABLE,
    Key: {
      connectionId: { S: connectionId }
    }
  };
  return new Promise((resolve, reject) => {
    DDB.deleteItem(params, function (err) {
      if(err){
        reject("Failed to disconnect: " + JSON.stringify(err));
      } else {
        resolve("success");
      }
    });
  });
}

let getMessages = (connectionId) => {
  var params = {
    ExpressionAttributeValues: {
     ":v1": {
       S: connectionId
      }
    }, 
    KeyConditionExpression: "ConnectionId = :v1", 
    ProjectionExpression: "messageId", 
    TableName: process.env.MESSAGES_TABLE
  };
  return new Promise((resolve, reject) => {
    DDB.query(params, (err, data)=>{
      if(err){
        reject("Could not retrieve messages: "+JSON.stringify(params))
      } else {
        resolve(data.Items);
      }
    })
  });
}

let deleteMessageBatch = (batch)=>{
  let params = {
    RequestItems: {
      [process.env.MESSAGES_TABLE]: batch.map(message=>{
        return {
          Key: {
            messageId: {S: message.messageId.S}, 
            connectionId: {S: connectionId},
          }
        }
      })
    },
  }
  return new Promise((resolve, reject) => {
    DBB.batchWriteItem(params, function(err, data) {
      if (err) reject("failed to delete messages: "+JSON.stringify(err)); // an error occurred
      else resolve("successfully deleted messages");
    });
  });
}

let deleteMessages = (connectionId) =>{
  return new Promise((resolve, reject) => {
    let results = [];
    let promises = [];
    getMessages(connectionId).then((result)=>{
      let messageChunks = chunk(result, 25); //dynamo db batchwrite can only handle 25 requests per batch
      //send off all message batch requests at once
      for(let i = 0; i++; i < messageChunks.length){
        promises.push(deleteMessageBatch(messageChunks[i]));
      }

      Promise.all(promises).then((values)=>{
        resolve(values);
      });

    });
  });
  
}

exports.handler = async function (event, context, callback) {
  return new Promise((resolve, reject) => {
    let connectionId = event.requestContext.connectionId
    let connectionDeletion = await deleteConnection(connectionId);
    let messagesDeletion = await deleteMessages(connectionId);
    resolve({status: "success", "message":"Disconnected, and deleted all messages"});
 });
};