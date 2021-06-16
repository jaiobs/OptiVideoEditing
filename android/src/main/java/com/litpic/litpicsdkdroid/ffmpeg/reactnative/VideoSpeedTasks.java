package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

public class VideoSpeedTasks {
    String[] command;

    String filePath;

    String destinationPath;

    public VideoSpeedTasks(String[] cmd, String filePath, String destinationPath) {
        this.command = cmd;
        this.filePath = filePath;
        this.destinationPath = destinationPath;
    }
}
