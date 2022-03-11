/* 
 * discord/music/subscription.js
 *
 *  Define MusicSubscription class.
 *  Control the queue and dispatch events to the MusicBot server.
 * 
 */

"use strict";

const io = require('socket.io-client');
const { getInfo } = require('ytdl-core');
require('dotenv').config();

class MusicSubscription {
  
	constructor(channel, chatChannel) {

        this.socket = io(process.env.MusicBotServer);

        this.queueLock = false;
	    this.queue = [];
        this.loop = false;
        this.currentTrack = undefined;
        
        this.socket.on('reqTrack', () => {
            this.ProcessQueue(false);
        });
        this.socket.on('unlockQueue', () => {
            this.queueLock = false;
        });
        this.socket.on('deleteErrorTrack', () => {
            chatChannel.send(`Failed to play Track : ${this.currentTrack.title}`);
            this.ProcessQueue(true);
        });
        this.socket.on('E_PlayerClass', () => {
            chatChannel.send(`Failed to prepare the Player. Please try again later.`);
        });

        this.socket.emit('initialize', channel.id, chatChannel.id);
	}

    ProcessQueue(flagError){
        if (this.queueLock) return;
        if (this.queue.length === 0 && this.loop === false){
          this.currentTrack = undefined;
          return;
        }

        // for a safety access
        this.queueLock = true;

        const previousTrack = this.currentTrack;
        this.currentTrack = this.queue.shift();
        if(this.loop === true && flagError === false && previousTrack !== undefined){
            this.queue.push(previousTrack);
        }
        this.socket.emit('newTrack', {
            url: this.currentTrack.url,
            loudnessDB : this.currentTrack.loudnessDB,
        });

        // unlock the queuelock after receiving the signal 'unlockQueue' from MusicBot server.
    }

    async enqueue(url, user){
        let info;
        let duration;
        info = await getInfo(url);
        duration = TimeConverter(info.videoDetails.lengthSeconds);
        this.queue.push({
            url : url,
		    title : info.videoDetails.title,
            duration : duration,
            lengthSeconds : info.videoDetails.lengthSeconds,
            loudnessDB : - info.player_response.playerConfig.audioConfig.loudnessDb - 30,
            author : user,
        });
    }
}

function TimeConverter(duration){
    const sec = ("0" + duration % 60).slice(-2);
    let min = Math.floor(duration / 60);
    if (min < 60){
      min = ("0" + min).slice(-2);
      const rtn = `${min}:${sec}`;
      return rtn;
    }else{
      const hr = Math.floor(min / 60);
      min = min % 60;
      min = ("0" + min).slice(-2);
      const rtn = `${hr}:${min}:${sec}`;
      return rtn;
    }
}

module.exports = {
    MusicSubscription: MusicSubscription
}