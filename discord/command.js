/* 
 * discord/command.js
 *
 *  Processsing the message prefixed with '!'
 * 
 */

client.on('messageCreate', message =>{
    if (message.author.bot){
      return;
    }
    if (message.content.startsWith('!')){
      call(message);
      return;
    }
});  

function call(message) {
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
  
    switch (command) {
        default:
            break;
    }
}