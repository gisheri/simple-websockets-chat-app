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
            }
        });
        resolve({status: "success", "messages":messages});
    });
}