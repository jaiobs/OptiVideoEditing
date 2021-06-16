package com.litpic.litpicsdkdroid.camerapreview.audioplayer;

import android.media.MediaPlayer;
import android.media.PlaybackParams;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import java.io.IOException;

public class BackgroundAudioPlayer implements MediaPlayer.OnPreparedListener, MediaPlayer.OnCompletionListener {

    private MediaPlayer mediaPlayer;
    private boolean isPrepared = false;

    private OnAudioCompletionListener onAudioCompletionListener;
    private boolean isCompleted = false;
    private int seekTo = -1;
    private boolean startWhenPrepared;

    public BackgroundAudioPlayer() {
        initPlayer();
    }

    private void initPlayer() {
        mediaPlayer = new MediaPlayer();
        mediaPlayer.setOnPreparedListener(this);
        mediaPlayer.setOnCompletionListener(this);
    }

    public void setAudio(String audio) {
        isPrepared = false;
        isCompleted = false;
        try {
            mediaPlayer.reset();
            mediaPlayer.setDataSource(audio);
            mediaPlayer.prepareAsync();
        } catch (IOException e) {
            Log.d("@@@", "Exception  - ", e);
        }
    }

    public void seekTo(int position) {
        if (isPrepared) {
            mediaPlayer.seekTo(position);
        } else {
            seekTo = position;
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    public void setSpeed(String speed) {
        PlaybackParams playbackParams = new PlaybackParams();
        switch (speed) {
            case "slow1":
                playbackParams.setSpeed(1.5f);
                break;
            case "slow2":
                playbackParams.setSpeed(2.0f);
                break;
            case "fast1":
                playbackParams.setSpeed(0.75f);
                break;
            case "fast2":
                playbackParams.setSpeed(0.5f);
                break;
            default:
                playbackParams.setSpeed(1.0f);
        }
        if (isPrepared) {
            try {
                mediaPlayer.setPlaybackParams(playbackParams);
            } catch (IllegalStateException e) {
                Log.d("@@@", "Exception - ", e);
            }
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    public void clearSpeed() {
        if (isPrepared) {
            try {
                mediaPlayer.getPlaybackParams().setSpeed(1.0f);
            } catch (IllegalStateException e) {
                Log.d("@@@", "Exception - ", e);
            }
        }
    }

    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        isPrepared = true;
        isCompleted = false;
        if (seekTo != -1) {
            mediaPlayer.seekTo(seekTo);
            seekTo = -1;
        }
        if (startWhenPrepared){
            startAudio();
        }
    }

    @Override
    public void onCompletion(MediaPlayer mediaPlayer) {
        isCompleted = true;
        if (onAudioCompletionListener != null) {
            onAudioCompletionListener.onAudioCompletion();
        }
    }

    public int getCurrentPosition() {
        if (isCompleted) {
            return mediaPlayer.getDuration();
        } else {
            return mediaPlayer.getCurrentPosition();
        }
    }

    public void pauseAudio() {
        mediaPlayer.pause();
    }

    public void startAudio() {
        mediaPlayer.start();
    }

    public void setLooping(boolean looping) {
        mediaPlayer.setLooping(looping);
    }

    public void stopAudio() {
        mediaPlayer.stop();
    }

    public void resetPlayer() {
        mediaPlayer.reset();
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setStartWhenPrepared(boolean startWhenPrepared){
        this.startWhenPrepared  = startWhenPrepared;
    }

    public void setAudioCompletionListener(OnAudioCompletionListener onAudioCompletionListener) {
        this.onAudioCompletionListener = onAudioCompletionListener;
    }

    public interface OnAudioCompletionListener {
        public void onAudioCompletion();
    }
}
