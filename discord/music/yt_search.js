/* 
 * discord/music/yt_search.js
 *
 *  Search Video from keywords or playlist using Youtube v3 API.
 * 
 */

"use strict";

const { google } = require('googleapis');
const { validateURL } = require('ytdl-core');

async function getURLsfromPlaylist(playlistid){
    let videoURLs = [];
    let errorvideos;
    let nextPageToken = undefined;
    let totalVideos;
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
      });
    do {
        let res = await youtube.playlistItems.list({
            playlistId: playlistid,
            maxResults: 50,
            pageToken: nextPageToken,
            part: 'contentDetails',
        });
        console.log(res);
        if(res.data.error !== undefined) {
            throw res.data.error.message;
        }
        for (let i = 0; i < res.data.items.length; i++) {
            let video_url = 'https://youtu.be/' + `${res.data.items[i].contentDetails.videoId}`;
            if (validateURL(video_url)) videoURLs.push(video_url);
        }
        nextPageToken = res.data.nextPageToken;
        totalVideos = res.data.pageInfo.totalResults;
    } while (nextPageToken !== undefined);

    errorvideos = totalVideos - videoURLs.length;

    return [videoURLs, errorvideos];
}

module.exports = {
    getURLsfromPlaylist: getURLsfromPlaylist
}