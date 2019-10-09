const AWS = require('aws-sdk');
const DocumentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const Dynamo = new AWS.DynamoDB({ apiVersion: "2012-10-08" })
const { CONNECTIONS_TABLE, MESSAGES_TABLE } = process.env;

exports.handler = async (event, context) => {
  let myConnectionId = event.requestContext.connectionId;
  let rand = Math.ceil(Math.random() * 9999)
  let messageId = myConnectionId+rand;
  const text = JSON.parse(event.body).text;

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  
  //save the item in the messages table
  try {
    await Dynamo.putItem({
      TableName: MESSAGES_TABLE,
      Item: {
        messageId: {S: messageId},
        connectionId: { S: myConnectionId },
        message: text,
      }
    });
  } catch(e){
    return { statusCode: 500, body: e.stack };
  }

  try {
    var connectionData = await DocumentClient.query({
      TableName: CONNECTIONS_TABLE,
      Limit: 10,
      ProjectionExpression: 'connectionId'
    }).promise();
  } catch (e) {
    console.log(e);
    return { statusCode: 500, body: e.stack };
  }

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    console.log(connectionId);
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify({connectionId: myConnectionId, text: text}) }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await Dynamo.deleteItem({ TableName: CONNECTIONS_TABLE, Key: { connectionId } }).promise();
      } else {
        console.log(e);
        throw e;
      }
    }
  });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    console.log(e);
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
