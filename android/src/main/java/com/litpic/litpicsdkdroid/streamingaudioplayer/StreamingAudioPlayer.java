package com.litpic.litpicsdkdroid.streamingaudioplayer;

import android.media.AudioManager;
import android.media.MediaPlayer;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.utils.AudioUtils;

import java.io.IOException;
import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.EVENT_ON_BUFFERING_UPDATE;

public class StreamingAudioPlayer
        implements MediaPlayer.OnPreparedListener, MediaPlayer.OnCompletionListener,
        MediaPlayer.OnBufferingUpdateListener {

    private MediaPlayer mediaPlayer;
    private String audioUrl;
    ReactApplicationContext reactAppContext;
    private boolean isBufferingCompleted = false;
    private String playingAudioId;
    LifecycleEventListener lifeCycleListener;

    StreamingAudioPlayer(ReactApplicationContext context) {
        initPlayer();

        lifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                // on host resume
            }

            @Override
            public void onHostPause() {
                if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
            }

            @Override
            public void onHostDestroy() {
                //on host destroy
            }

        };
        context.addLifecycleEventListener(lifeCycleListener);
        reactAppContext = context;
    }

    StreamingAudioPlayer() {
        initPlayer();
    }

    private void initPlayer() {
        mediaPlayer = new MediaPlayer();
        mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);          // NOSONAR
        mediaPlayer.setOnPreparedListener(this);
        mediaPlayer.setOnCompletionListener(this);
        mediaPlayer.setOnBufferingUpdateListener(this);
    }

    /*
     * Downloaded audio accessed through cache
     */
    boolean isCachedAudio;

    void setAudioUrl(String audioUrl) {
        try {
            String tempAudioId = "";
            String file = AudioUtils.getSoundIfCached(reactAppContext, audioUrl);
            tempAudioId = AudioUtils.getSoundId(audioUrl);
            if (file != null) {
                this.audioUrl = file;
                isCachedAudio = true;
            } else {
                this.audioUrl = audioUrl + Constants.AUDIO_CLIENT_KEY;
                isCachedAudio = false;
            }

            if (tempAudioId.equals(playingAudioId)) {
                mediaPlayer.start();
                if (isBufferingCompleted) {
                    sendBufferUpdateEvent(Arguments.createMap());
                }
            } else {
                playingAudioId = AudioUtils.getSoundId(audioUrl);
                setPlayer();
                isBufferingCompleted = false;
            }
        } catch (Exception e) {
            Log.d("@@@@", "streaming audio player exception - ", e);
        }
    }

    void setPlayer() {
        try {
            mediaPlayer.reset();
            mediaPlayer.setDataSource(this.audioUrl);
            mediaPlayer.prepareAsync();
        } catch (IOException e) {
            Log.d("@@@", "Exception", e);
        }
    }

    void setAudioPath(String audioUrl) {
        try {
            mediaPlayer.reset();
            mediaPlayer.setDataSource(audioUrl);
            mediaPlayer.prepareAsync();
        } catch (IOException e) {
            Log.d("@@@", Objects.requireNonNull(e.getLocalizedMessage()));
        }
    }

    void pauseAudio() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            isBufferingCompleted = true;
            mediaPlayer.pause();
        }
    }

    void playAudio() {
        mediaPlayer.start();
    }

    /**
     * media player callback listeners
     *
     * @param mediaPlayer -
     */
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        if (isCachedAudio) {
            sendBufferUpdateEvent(Arguments.createMap());
        }
        mediaPlayer.start();
    }

    @Override
    public void onCompletion(MediaPlayer mediaPlayer) {
        mediaPlayer.reset();
        this.audioUrl = "";
    }

    @Override
    public void onBufferingUpdate(MediaPlayer mediaPlayer, int i) {
        //on buffering update
        if (i > 1 && mediaPlayer.isPlaying()) {
            sendBufferUpdateEvent(Arguments.createMap());
        }
        if (i == 100) {
            isBufferingCompleted = true;
        }
    }

    private void sendBufferUpdateEvent(WritableMap imageResponse) {
        sendEvent(reactAppContext, EVENT_ON_BUFFERING_UPDATE, imageResponse);
    }

    private void sendEvent(ReactContext reactContext, String eventName,
                           @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    void stopAudio() {
        this.audioUrl = "";
        this.playingAudioId = "";

        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.stop();
            }
            mediaPlayer.reset();
        }
    }

    void play() {
        if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
            mediaPlayer.start();
        }
    }

    public void releaseListeners() {
        reactAppContext.removeLifecycleEventListener(lifeCycleListener);
    }
}

