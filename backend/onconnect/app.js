// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
var DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

let saveConnection = (connectionId, username) => {
  return new Promise((resolve, reject) => {
    DDB.putItem({
      TableName: process.env.CONNECTIONS_TABLE,
      Item: {
        connectionId: { S: connectionId },
        username: { S: username }
      }
    }, (err)=>{
      return err 
        ? reject(`failed to save connection: ${JSON.stringify(err)}`)
        : resolve("success");
    });
  });
}

exports.handler = async function (event) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  let connectionId = event.requestContext.connectionId;
  let username = "user_"+(Math.floor(Math.random() * 99999)+1);
  try {
    await saveConnection(connectionId, username);
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify({text: "[welcome]", connectionId: connectionId}) }).promise();
  } catch(err){
    if(err.statusCode == 410){
      //ignore
    } else {
      return {statusCode: 500, body: JSON.stringify({status:"failed", message: "Failed to connect: "+JSON.stringify(err)}) }
    }
  }
      
  return {statusCode: 200, body: JSON.stringify({status:"connected", connectionId: connectionId, username: username})}
};
