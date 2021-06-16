package com.litpic.litpicsdkdroid.streamingaudioplayer;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class StreamingAudioPlayerModule extends ReactContextBaseJavaModule {

    private StreamingAudioPlayer streamingAudioPlayer;

    public StreamingAudioPlayerModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        initAudioPlayer(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "StreamingAudioPlayerModule";
    }

    private void initAudioPlayer(ReactApplicationContext reactContext) {
        streamingAudioPlayer = new StreamingAudioPlayer(reactContext);
    }

    @ReactMethod
    public void playAudio(final String audioPath) {
        streamingAudioPlayer.setAudioUrl(audioPath);
    }


    @ReactMethod
    public void setAudioPath(final String audioPath) {
        streamingAudioPlayer.setAudioPath(audioPath);
    }

    /**
     * pause audio
     */
    @ReactMethod
    public void pauseAudio() {
        streamingAudioPlayer.pauseAudio();
    }

    /**
     * pause audio
     */
    @ReactMethod
    public void play() {
        streamingAudioPlayer.play();
    }

    /**
     * stop audio
     */
    @ReactMethod
    public void stopAudio() {
        streamingAudioPlayer.stopAudio();
    }

    /**
     * release native listeners
     */
    @ReactMethod
    public void releaseListeners() {
        streamingAudioPlayer.releaseListeners();
    }

}
