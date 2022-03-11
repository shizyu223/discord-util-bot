/* 
 * discord/enter/index.js
 *
 *  Notification when someone enters voiceChannel
 * 
 */

const Canvas = require('canvas');

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) =>{
    const gulid = newState.guild;
    if(newState.channel !== oldState.channel){
      const notifChannelID = client.channels.cache.filter((channel)=> channel.id === process.env.NOTIF_TEXTCHANNEL_ID).first();
     if(oldState.channel === null){
        if(newState.channel.id === gulid.afkChannelId)return;
        if(newState.member.user.bot === true)return;
        notifChannelID.send(newState.member.displayName + " logged into __" + newState.channel.name +"__ !\n");
        const activeVoiceCh = gulid.channels.cache.filter(c => c.type === 'GUILD_VOICE' && c.members.size !== 0).size;
        for(let i = 0; i < activeVoiceCh; i++){
          const currentChannel = gulid.channels.cache.filter(c => c.type === 'GUILD_VOICE' && c.members.size !== 0).at(i);
          notifChannelID.send({content: currentChannel.members.size + " user(s) in __" + currentChannel.name + "__ channel.\n", files: [{attachment: await userIconsVoiceCh(currentChannel)}]});
        }
      }else if(newState.channel === null){
        if(gulid.channels.cache.filter(c => c.type === 'GUILD_VOICE' && memberSizeExceptBot(c) === true).size === 0 && oldState.channel.id !== gulid.afkChannelId){
          if(gulid.channels.cache.filter(c => c.type === 'GUILD_VOICE' && c.members.size !== 0).size === 0)notifChannelID.send("There are no users in the VoiceChannels now.\n");
        }
      }
    }
  });
};

function memberSizeExceptBot(channel){
  const memsize = channel.members.size;
  if(memsize === 0)return false;
  else if(memsize <= process.env.MusicBot_num){
    for (let i = 0; i < memsize; i++){
      if(channel.members.at(i).user.bot === false)return true;
    }
    return false;
  }
  else return true;
}

async function userIconsVoiceCh(voiceCh){
  let userSize = voiceCh.members.size;
  if(userSize === 0)return null;
  const canvas = Canvas.createCanvas(29 * userSize - 5, 24);
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  for(let i = 0; i < userSize; i++){
    createRoundRectPath(ctx, 29 * i, 0, 24, 24, 3);
  }
  ctx.closePath();
  ctx.clip();
  for(let i = 0; i < userSize; i++){
    const pfp = await Canvas.loadImage(
      voiceCh.members.at(i).displayAvatarURL({
        size:128, format: 'png',
      })
    )
    const posx = 29 * i;
    ctx.drawImage(pfp, 0, 0, 128, 128, posx, 0, 24, 24);
  }
  return canvas.toBuffer();
}

function createRoundRectPath(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, Math.PI * (3/2), 0, false);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * (1/2), false);
    ctx.lineTo(x + r, y + h);       
    ctx.arc(x + r, y + h - r, r, Math.PI * (1/2), Math.PI, false);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * (3/2), false);
}