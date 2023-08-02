const fs = require('fs'); const axios = 
require('axios'); const admin = 
require('firebase-admin'); const path = 
require('path'); const { Bot } = 
require('fb-messenger-bot');
// Initialize Firebase Admin SDK (Make sure to 
// have your service account key ready)
const serviceAccount = 
require('path/to/serviceAccountKey.json'); 
admin.initializeApp({
  credential: 
  admin.credential.cert(serviceAccount), 
  databaseURL: 
  'https://facebookbot-7f1da-default-rtdb.asia-southeast1.firebasedatabase.app/',
});
// Replace with your GPT API endpoint and API key
const gptApiUrl = 
'https://api.openai.com/v1/engines/davinci-codex/completions'; 
const gptApiKey = 
'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';
// Replace with your other Facebook account user 
// ID
const otherAccountUserID = '100010235026972'; 
const prefix = '!'; let badWordCount = {}; let 
vips = ['100050076673558']; const 
welcomeGifDirectory = './welcome_gifs'; const 
goodbyeGifDirectory = './goodbye_gifs'; async 
function getUserName(bot, senderID) {
  const response = await 
  bot.getUserProfile(senderID); return 
  response.first_name;
}
// Function to save unsent data to Firebase
async function saveUnsentDataToFirebase(senderID, 
threadID, unsentData) {
  // Replace 'unsent_messages' with the desired 
  // Firebase database node
  await 
  admin.database().ref('unsent_messages').push({
    senderID: senderID, threadID: threadID, data: 
    unsentData, timestamp: Date.now(),
  });
}
async function sendUnsentDataToOtherAccount(bot, 
unsentData) {
  const { threadID, data } = unsentData; 
  bot.sendTextMessage(otherAccountUserID, data, 
  threadID);
}
// Function to interact with GPT API
async function interactWithGPTAPI(prompt) { try { 
    const response = await axios.post(
      gptApiUrl, { prompt: prompt, max_tokens: 
        100, // Adjust the max tokens as needed
      },
      { headers: { 'Content-Type': 
          'application/json', Authorization: 
          `Bearer ${gptApiKey}`,
        },
      }
    ); return response.data.choices[0].text;
  } catch (error) {
    console.error('Error interacting with GPT 
    API:', error.message); return 'Sorry, I 
    encountered an error while processing your 
    question.';
  }
}
// Function to get random GIF file path from a 
// directory
function getRandomGifPath(directory) { const 
  gifFiles = fs.readdirSync(directory); if 
  (gifFiles.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * 
  gifFiles.length); return path.join(directory, 
  gifFiles[randomIndex]);
}
// Replace with your own Facebook login 
// credentials or use environment variables
const credentials = { email: 
  'domingo.laden8210@gmail.com', password: 
  'dota12QWE',
};
// Initialize your Facebook chatbot here (replace 
// this part with your chosen Facebook Messenger 
// library) Use the credentials to log in and 
// listen for incoming messages For example, using 
// "fb-messenger-bot" (this is just a placeholder, 
// replace it with your actual Facebook Messenger 
// library)
const bot = new Bot({ token: 
  'EAAEAbTyUzPIBO0oCcIuHerFch2oJzLBYMGYkJ9mEeEItuDr7HMa2QZB42Bb9jw4zL7G457eb1ppy5U6967ISDSCbV49nP7YDDgM3aGrXirI3BiKy8V8hOBJxvwP7JZCcTHza3Va0JvoZCfKOPjLb9ndbxPDUEHga0Bbvd2Mw4cuqvV17oiaVVW6bM6X', 
  // Replace with your Facebook page access token
});
bot.on('message', async (event) => { const { 
  sender, message } = event; switch (message.type) 
  {
    case 'text': if 
      (message.text.startsWith(prefix + 
      'question')) {
        const question = 
        message.text.slice(prefix.length + 
        9).trim(); // Remove the command prefix 
        and the word "question" if (question === 
        '') {
          bot.sendTextMessage(sender.id, 'Please 
          provide a question.'); return;
        }
        const response = await 
        interactWithGPTAPI(question); 
        bot.sendTextMessage(sender.id, response);
      }
      // ... Existing code for handling various 
      // other commands ...
      break; case 'message_unsend': if 
      (vips.includes(sender.id)) {
        const unsentData = { senderID: sender.id, 
          threadID: message.threadID, data: 
          message.text || message.attachments, // 
          Save either text or attachments (images, 
          videos, files)
        };
        // Save unsent data to Firebase
        await saveUnsentDataToFirebase(sender.id, 
        message.threadID, unsentData);
        // Send unsent data to your other Facebook 
        // account
        sendUnsentDataToOtherAccount(bot, 
        unsentData);
      }
      break; default: break;
  }
});
// Start listening to incoming messages
bot.start();
