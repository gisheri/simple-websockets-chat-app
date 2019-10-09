const AWS = require("aws-sdk")
AWS.config.update({ region: process.env.AWS_REGION });
var DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

const limit = 300;
exports.handler = async function(event, contex){
    let messages;
    try {
        messages = await ddb.query({
            TableName: process.env.MESSAGES_TABLE,
            Limit: limit,
        }).promise();
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({status: "failed", "message":`Failed to retrieve messages ${e.message()}` }) };
    }

    messages = messages.items.map(message=>{
        return {
            messageId: message.messageId.S,
            connectionId: message.connectionId.S,
            message: message.message.S,
        }
    });
    return {
        statusCode: err ? 500 : 200,
        body: err 
            ? JSON.stringify({status: "failed", "message": "Failed to connect: " + JSON.stringify(err) } )
            : JSON.stringify({status: "success", "messages":messages})
    }
}