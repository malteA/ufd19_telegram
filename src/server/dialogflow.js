require("dotenv").config({ path: '/' });

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
                const result = response[0].queryResult;
                let parameters = [];
                if (result.parameters) {
                    parameters = getParameters(result.parameters.fields);
                }
                if (result.intent) {
                    const intent = result.action;
                    resolve({intent, parameters});
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

const getParameters = (paramFields) => {
    const parameters = {};
    const keys = Object.keys(paramFields);
    keys.map(field => parameters[field] = paramFields[field].stringValue)
    return parameters; 
}

module.exports = getIntent;
