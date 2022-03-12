/* 
 * discord/music/yt_search.js
 *
 *  Search Video from keywords or playlist using Youtube v3 API.
 * 
 */

"use strict";

const { google } = require('googleapis');

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
        let reqOps = {
            playlistId: playlistid,
            maxResults: 50,
            part: 'snippet',
        }
        if (nextPageToken) {
            reqOps.pageToken = nextPageToken;
        }
        let res = await youtube.playlistItems.list(reqOps);
        if(res.data.error !== undefined) {
            throw res.data.error.message;
        }
        for (let i = 0; i < res.data.items.length; i++) {
            let video_url = 'https://youtu.be/' + `${res.data.items[i].snippet.resourceId.videoId}`;
            if (!isEmpty(res.data.items[i].snippet.thumbnails)){
                videoURLs.push(video_url);
            }
        }
        nextPageToken = res.data.nextPageToken;
        totalVideos = res.data.pageInfo.totalResults;
    } while (nextPageToken !== undefined);

    errorvideos = totalVideos - videoURLs.length;

    return [videoURLs, errorvideos];
}

async function validateVideoURL(url){
    let videoId;
    if(url.match('https?://www.youtube.com/watch')) {
        videoId = url.split('=')[1];
    } else if(url_.match('https?://youtu.be/')){
        videoId = url.split('/')[3];
    } else return false  
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
      });
    let res = await youtube.videos.list({
        id: videoId,
        part: 'snippet',
      });

    // if a video is unavailable, totalResults is 0 and the array 'items' has no member.
    if (res.data.pageInfo.totalResults !== 0) return true;
    else return false;
}

function isEmpty(obj) {
    const _isEmpty = Object.keys(obj).length === 0 && obj.constructor === Object;
    return _isEmpty;
}

module.exports = {
    getURLsfromPlaylist: getURLsfromPlaylist,
    validateVideoURL: validateVideoURL
}