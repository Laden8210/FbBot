// Add the functions interactWithGPTAPI, 
// saveUnsentDataToFirebase, and 
// sendUnsentDataToOtherAccount here
const express = require('express'); 
const bodyParser = require('body-parser'); 
const {MessengerBot} = require('fb-messenger-bot');
const pageAccessToken = 'EAAEAbTyUzPIBO6AqZBg6eMiAUCpQBmYuMFv35wqiY4wHFouyojhcEzZCky2IEJSQR2iHQ5ZBbclplA15ZBbEraxxOpVBosuxh6fuoGuesuNwZCGzqAnZB5EXiLpTqdCPnISVpxUFuAJZBENa0T3cZBZASPk0p4vpR3ToskQQl0qfLXuz7JjF3yqhW4yFG1BXh'; const 
verifyToken = 'bot_8210'; 
const prefix = 
'!'; const vips = ['100050076673558']; const app = 
express(); app.use(bodyParser.json()); 
const bot =new MessengerBot({ accessToken:pageAccessToken});
app.get('/webhook', (req, res) => { const mode = 
  req.query['hub.mode']; const token = 
  req.query['hub.verify_token']; const challenge = 
  req.query['hub.challenge']; if (mode && token 
  === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
app.post('/webhook', bot.middleware(), (req, res) => {
  const { sender, message } = 
  req.body.entry[0].messaging[0]; switch 
  (message.type) {
    case 'text': if 
      (message.text.startsWith(prefix + 
      'question')) {
        const question = 
        message.text.slice(prefix.length + 
        9).trim(); if (question === '') {
          bot.sendTextMessage(sender.id, 'Please  provide a question.'); return;
        }
        interactWithGPTAPI(question) 
          .then((response) => {
            bot.sendTextMessage(sender.id, 
            response);
          })
          .catch((error) => { console.error('Error  interacting with GPT API:', error.message); 
            bot.sendTextMessage(sender.id, 'Sorry,  I encountered an error while processing your question.');
          });
      }
      // ... Add other cases for handling various 
      // other commands ...
      break; case 'message_unsend': if 
      (vips.includes(sender.id)) {
        const unsentData = { senderID: sender.id, 
          threadID: message.threadID, data: 
          message.text || message.attachments,
        };
        saveUnsentDataToFirebase(sender.id, 
        message.threadID, unsentData)
          .then(() => { 
            sendUnsentDataToOtherAccount(bot, 
            unsentData);
          })
          .catch((error) => { console.error('Error saving unsent data:', error.message);
          });
      }
      break; default: break;
  }
  res.sendStatus(200);
});
const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(`Server is running on port   ${port}`);
});
bot.onEvent(async (context) => { const { sender, 
  message } = context.event;
  // Handle other events here, if needed
});

