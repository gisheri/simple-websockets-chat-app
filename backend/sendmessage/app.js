const AWS = require('aws-sdk');
const DocumentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const Dynamo = new AWS.DynamoDB({ apiVersion: "2012-10-08" })
const { CONNECTIONS_TABLE, MESSAGES_TABLE } = process.env;

exports.handler = async (event, context) => {
  let connectionData;
  let connectionId = event.requestContext.connectionId;

  try {
    connectionData = await DocumentClient.scan({ TableName: CONNECTIONS_TABLE, ProjectionExpression: 'connectionId' }).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  let rand = Math.ceil(Math.random() * 9999)
  let messageId = event.requestContext.connectionId+rand;
  const message = {connectionId: connectionId, data: JSON.parse(event.body).data};
  
  //save the item in the messages table
  try {
    await Dynamo.putItem({
      TableName: MESSAGES_TABLE,
      Item: {
        messageId: {S: messageId},
        connectionId: { S: connectionId },
      }
    });
  } catch(e){
    throw e;
  }

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(message) }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb.delete({ TableName: CONNECTIONS_TABLE, Key: { connectionId } }).promise();
      } else {
        throw e;
      }
    }
  });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
