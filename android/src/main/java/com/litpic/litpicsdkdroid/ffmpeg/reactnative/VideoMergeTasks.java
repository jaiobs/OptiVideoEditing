package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

import com.facebook.react.bridge.Callback;

public class VideoMergeTasks {
    String[] command;

    Callback callback;

    String filePath;

    boolean isSingleVideo = false;

    public VideoMergeTasks(String[] cmd, Callback callback, String filePath) {
        this.command = cmd;
        this.callback = callback;
        this.filePath = filePath;
    }

    public VideoMergeTasks(String[] cmd, Callback callback, String filePath,boolean isSingleVideo) {
        this.command = cmd;
        this.callback = callback;
        this.filePath = filePath;
        this.isSingleVideo = isSingleVideo;
    }
}
