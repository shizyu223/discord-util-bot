/* 
 * discord/music/index.js
 *
 *  Get command related to the musicbot and send it to bot
 * 
 */

"use strict";

const {
  musicPlay,
  musicSkip,
  musicQueue,
  musicLoop,  
  musicPause,  
  musicResume,
  musicLeave,
} = require('./musicFunc.js');

module.exports = (client) => {
    client.on('messageCreate', message =>{
        if (message.author.bot){
          return;
        }
        if (message.content.startsWith('!')){
            // if(!musicChannelCheck(message))return;
            switch(message.content.split(' ')[0]){
                case '!play':
                  if(!musicPlay(message))return;
                  break;
                case '!skip':
                  if(!musicSkip(message))return;
                  break;
                case '!queue':
                  if(!musicQueue(message))return;
                  break;
                case '!loop':
                  if(!musicLoop(message))return;
                  break;
                case '!pause':
                  if(!musicPause(message))return;
                  break;
                case '!resume':
                  if(!musicResume(message))return;
                  break;
                case '!leave':
                  if(!musicLeave(message))return;
                  break;
                default:
                  break;
            }
            return;
        }
    })
}
