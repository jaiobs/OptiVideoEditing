package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

import com.facebook.react.bridge.Callback;

public class CompressVideo {
    Callback callback;

    String filePath;

    public CompressVideo(Callback callback, String filePath){
        this.filePath = filePath;
        this.callback = callback;

    }
}
