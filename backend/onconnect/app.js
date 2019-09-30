// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
var DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

exports.handler = function (event, context, callback) {
  let connectionId = event.requestContext.connectionId;
  let username = "user_"+(Math.floor(Math.random() * 99999)+1);
  var putParams = {
    TableName: process.env.CONNECTIONS_TABLE,
    Item: {
      connectionId: { S: connectionId },
      username: { S: username }
    }
  };

  DDB.putItem(putParams, function (err) {
    callback(null, {
      statusCode: err ? 500 : 200,
      body: err 
        ? JSON.stringify({status: "failed", "message": "Failed to connect: " + JSON.stringify(err) } )
        : JSON.stringify({status:"connected", connectionId: connectionId, username: username})
    });
  });
};
