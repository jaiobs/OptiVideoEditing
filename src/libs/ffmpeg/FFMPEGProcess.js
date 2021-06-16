import React from 'react';
import {NativeModules, NativeEventEmitter} from 'react-native';

const ffmpegObj = NativeModules.FfmpegProcessor;
const eventEmitter = new NativeEventEmitter(ffmpegObj);

export function showVersionDetails(callback) {
  ffmpegObj.showVersion(callback);
}

export async function executeCommand(command, callback) {
  ffmpegObj.executeCommand(command, callback);
}

export async function addFFMPEGStatsListener(callback) {
  eventEmitter.addListener('EventFFMPEGStats', (data) => {
    callback(data);
  });
}

export async function getThumbnailImagesFromVideo(videoPath) {
  ffmpegObj.getThumbnailImagesFromVideo(videoPath);
}

export async function addThumbnailListener(callback) {
  eventEmitter.addListener('ThumbnailEmitter', (data) => {
    callback(data);
  });
}

export async function trimVideo(trimmingOptions, callback) {
  ffmpegObj.trimVideo(
    trimmingOptions.path,
    trimmingOptions.startTime,
    trimmingOptions.endTime,
    callback,
  );
}

export async function concatVideo(videoFiles, callback) {
  ffmpegObj.concatVideos(videoFiles, callback);
}

export async function compressVideo(videodata, callback) {
  ffmpegObj.compressVideo(videodata, callback);
}

export async function movAtomToVideo(videoPath, callback) {
  ffmpegObj.addMovAtomToVideo(videoPath, callback);
}
export async function convertImagesToVideo(imageFiles, callback) {
  ffmpegObj.convertImagesToVideo(imageFiles, callback);
}

export async function copyFilesToCache(videoFiles,callback){
  ffmpegObj.copyFilesToCache(videoFiles, callback);
}

export async function copyImagesToCache(imageFiles,callback){
  ffmpegObj.copyImagesToCache(imageFiles, callback);
} 

export function applyVideoSpeed(
  speed,
  filePath,
  audioPath,
  audioStartingPosition,
  audioEndPosition,
) {
  ffmpegObj.setVideoSpeed(
    speed,
    filePath,
    audioPath,
    audioStartingPosition,
    audioEndPosition,
  );
}
