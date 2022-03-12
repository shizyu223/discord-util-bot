/* 
 * discord/music/musicFunc.js
 *
 *  Process command with MusicSubscription class
 * 
 */

"use strict";

const { MusicSubscription } = require('./subscription');
const { getURLsfromPlaylist, validateVideoURL } = require('./yt_search');

var subscription;

async function musicPlay(message){
    // Extract Video URL from the message
    const url_ = message.content.split(' ')[1];
    if(url_ == undefined){
        message.reply("!play command - \"!play [Youtube url]\"\n for detail, please try !help command.");
        return;
    }    

    // Get the VoiceChannel in which the message owner is
    const channel = message.member.voice.channel;
    // Get the textchannel where the message is emitted
    const chatChannel = message.channel;
    // Suspend if the message owner is not in any VoiceChannel
    if (!channel) return message.reply('Use !play command when you are in VoiceChannel.');
 

    let url = [];
    let playlistid;
    let numErrorVideos = 0
    let rawurl, ErrorVideos;
    // if URL is playlist
    if(url_.match('^h?ttps?://www.youtube.com/playlist')){
        let query = url_.split('?')[1];
        console.log(query.split('&').filter((q) => q.match('list=')));
        playlistid = query.split('&').filter((q) => q.match('list='))[0].split('=')[1];
        try {
            [rawurl, ErrorVideos] = await getURLsfromPlaylist(playlistid);
        } catch (err) {
            return message.reply(`Youtube API error: ${err}`);
        }
        numErrorVideos = ErrorVideos;
        if(message.content.split(' ')[2] === 'shuffle'){
            // url = shuffle(rawurl);
        } else url = rawurl;
    }
    // if URL is video, ttp -> http
    else {
        if(url_.match('^h?ttps?://www.youtube.com/watch')){
            if (url_.charAt(0) === 't') url = 'h' + url_.split('&')[0];
            else url[0] = url_.split('&')[0];
        } else if(url_.match('^h?ttps?://youtu.be/')){
            if (url_.charAt(0) === 't') url = 'h' + url_.split('?')[0];
            else url[0] = url_.split('?')[0];
        } else {
            return message.reply(`${url[0]} is not valid or not Youtube URL.`);
        }
        // Judge whether the Youtube URL is valid
        const validVideoURL = await validateVideoURL(url[0]);
        console.log(validVideoURL);
        if (!validVideoURL) return message.reply(`${url[0]} is not valid or not Youtube URL.`);
    }   
   
    console.log(numErrorVideos);

    // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
    // and create a subscription.
    if (!subscription) {
      subscription = new MusicSubscription(channel, chatChannel);
    }

    let initQueuepush = false;
    if(subscription.currentTrack === undefined) initQueuepush = true;
    for(let i = 0; i < url.length; i++) {
        subscription.enqueue(url[i], message.author)
            .then(() => {
                if(initQueuepush === true && i === 0) subscription.ProcessQueue(false);
            });
    }
}

async function musicQueue(message){
    // Print out the current queue, including up to the next 10 tracks to be played.
    // memo : author information, which expresses in mention style, should be contained in a embed message to avoid notifying users.
	if (subscription) {
		const current =
			(subscription.queue.length === 0 && subscription.currentTrack === undefined)
				? `Nothing is currently playing!`
				: `Playing **${subscription.currentTrack.title}** \`[${subscription.currentTrack.duration}]\``;
        
		const queue = subscription.queue
			.slice(0, 10)
			.map((track, index) => `\`${index + 1}) [${track.duration}]\` ${track.title}`)
			.join('\n');
      
        if (subscription.loop === true) message.channel.send(`${current} 🔁\n\n${queue}`);
        else message.channel.send(`${current}\n\n${queue}`);
	} else {
		message.reply('Not playing in this server!');
	}
}

async function musicLoop(message){
    if (subscription) {
        if (message.content.split(' ').length < 2){
        subscription.loop = true;
        }
        else if (message.content.split(' ')[1] === 'break'){
		    subscription.loop = false;
        }else{
            message.reply('Invalid command.');
        }
    } else {
		message.reply('Not playing in this server!');
	}
}

async function musicSkip(message){
    if (subscription && (subscription.queue.length !== 0 || subscription.currentTrack !== undefined)) {
		// Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
		// listener defined in MusicBot, transitions into the Idle state mean the next track from the queue will be loaded and played.
		subscription.socket.emit('musicSkip');
		message.channel.send('Skipped song!');
	} else {
		message.reply('Not playing in this server!');
	}    
}

async function musicPause(message){
    if (subscription && (subscription.queue.length !== 0 || subscription.currentTrack !== undefined)) {
		subscription.socket.emit('musicPause');
		message.reply(`⏸ **${subscription.queue[0].title}**`);
    } else {
		message.reply('Not playing in this server!');
	}
}

async function musicResume(message){
    if (subscription && (subscription.queue.length !== 0 || subscription.currentTrack !== undefined)) {
		subscription.socket.emit('musicResume');
		message.reply(`▶️ **${subscription.queue[0].title}**`);
    } else {
		message.reply('Not playing in this server!');
	}    
}

async function musicLeave(message){
    if (subscription) {
        musicDestroy();
        message.reply('The queue has been cleared!');
	} else {
		message.reply('Not playing in this server!');
	}    
}

function musicDestroy(){
    if(subscription){
        subscription.socket.emit('destroy');
        subscription = undefined;
		console.log(`Left channel!`);
    }
}


module.exports = {
    musicPlay: musicPlay,
    musicQueue: musicQueue,
    musicLoop: musicLoop,
    musicSkip: musicSkip,
    musicPause: musicPause,
    musicResume: musicResume,
    musicLeave: musicLeave
}