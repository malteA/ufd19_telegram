require("dotenv").config();

const dialogflow = require("dialogflow");

const dialogflowConfig = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PROJECT_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_PROJECT_EMAIL
    }
};

const dialogflowClient = new dialogflow.SessionsClient(dialogflowConfig);

// define session path
const sessionPath = dialogflowClient.sessionPath(process.env.DIALOGFLOW_PROJECT_ID, "quickstart-session-id");

// the text query request
/**
 * 
 * @param {string} query string to be resolved
 * @param {string} languageCode language identifier (en|de)
 * @returns {object} dialogflow request object
 */
const getRequest = (query, languageCode) => {
    return {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    }
};

/**
 * 
 * @param {string} query string to be resolved
 * @param {string} languageCode language identifier (en|de)
 * @returns intent
 */
const getIntent = async (query, languageCode) => {
    return new Promise((resolve, reject) => {
        dialogflowClient
            .detectIntent(getRequest(query, languageCode))
            .then(response => {
                console.log("Detected Intent");
                const result = response[0].queryResult;
                console.log(`  Query: ${result.queryText}`);
                console.log(`  Response: ${result.fulfillmentText}`);
                if (result.intent) {
                    console.log(`  Intent: ${result.intent.displayName}`);
                    resolve(result.intent.displayName);
                } else {
                    console.log(`  No intent matched.`);
                    resolve(`  No intent matched.`);
                }
            })
            .catch(err => {
                console.log("ERROR:", err);
                reject(err);
            });
        });
};

module.exports = getIntent;
