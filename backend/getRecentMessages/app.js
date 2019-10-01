const AWS = require("aws")
AWS.config.update({ region: process.env.AWS_REGION });
var DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

const limit = 300;
exports.handler = async function(event, contex){
    return new Promise((resolve, reject) =>{
        
        let messages;
        try {
            messages = await ddb.query({
                TableName: process.env.MESSAGES_TABLE,
                limit: limit,
            }).promise();
        } catch (e) {
            reject({ statusCode: 500, body: e.stack });
        }

        messages = messages.items.map(message=>{
            return {
                messageId: message.messageId.S,
                connectionId: message.connectionId.S,
                message: message.message.S,
            }
        });
        resolve ({
            statusCode: err ? 500 : 200,
            body: err 
              ? JSON.stringify({status: "failed", "message": "Failed to connect: " + JSON.stringify(err) } )
              : JSON.stringify({status: "success", "messages":messages})
        })
    });
}