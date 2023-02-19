# AskQuija Bot

### How to Use
1. Create an application at [Discord Dev Portal](https://discord.com/developers/applications)
2. Create a bot
   - Go to the bot tab and click ***Add Bot***
   - After adding scroll down to **Privileged Gateway Intents** and turn on ***Message Content Intent***
3. Add to server
   - Go to the OAuth2 tab
   - Click URL Generator
   - Add the ***bot*** and ***application.commands*** scopes
   - Copy the generated url at the bottom
   - Paste into web browser and add to desired server
4. Install [NodeJS](https://nodejs.org/en/download/)
5. Add Credentials to ***.env*** file
   - See ***.envExample*** for format
   - **Token** is from bot tab mentioned above (don't lose or expose this)
   - **Client ID** is from OAuth2 tab
6. Run ***npm install***
7. Run ***npm start*** && ***npm deploy*** to start the bot
8. Use the **/ask** command in the server
9. Enjoy :)