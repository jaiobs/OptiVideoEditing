package com.litpic.litpicsdkdroid.audiotrimming.customviews;

import android.content.Context;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Handler;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;

import androidx.annotation.Nullable;

import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.MediaPreparedListener;
import com.litpic.litpicsdkdroid.audiotrimming.player.AudioPlayer;

import java.io.IOException;


public class SoundWaveView extends FrameLayout implements MediaPlayer.OnCompletionListener, MediaPlayer.OnPreparedListener {

    protected final Context context;
    protected int layout = R.layout.sound_bar_view;

    private SoundVisualizerBarView visualizerBar;

    private final AudioPlayer audioPlayer = new AudioPlayer();
    private final Handler handler = new Handler();
    private Runnable runnable;
    private MediaPreparedListener mediaPreparedListener;
    private static final long INTERVAL = 100;

    public SoundWaveView(Context context) {
        super(context);
        this.context = context;

        init(context);
    }

    public SoundWaveView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        this.context = context;

        init(context);
    }

    public SoundWaveView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;

        init(context);
    }

    public void addAudioFileUri(final Uri audioFileUri) throws IOException {
        addAudioFileUrl(audioFileUri.toString());
        visualizerBar.updateVisualizer(audioFileUri);
    }

    public void addAudioFileUrl(String audioFileUrl) throws IOException {
        audioPlayer.setDataSource(audioFileUrl);
        audioPlayer.prepareAsync();
        visualizerBar.updateVisualizer(audioFileUrl);
    }

    protected void init(final Context context) {
        View view = LayoutInflater.from(context).inflate(layout, this);

        audioPlayer.setOnCompletionListener(this);
        audioPlayer.setOnPreparedListener(this);

        visualizerBar = view.findViewById(R.id.sound_bar_view);

        runnable = new Runnable() {
            @Override
            public void run() {
                if (audioPlayer.isPlaying()) {
	                visualizerBar.updatePlayerPercent((audioPlayer.getCurrentPosition() * 1.0f) / audioPlayer.getDuration());
                    handler.postDelayed(this, INTERVAL);
                }
            }
        };
    }

    public void setMediaPreparedListener(MediaPreparedListener mediaPreparedListener) {
        this.mediaPreparedListener = mediaPreparedListener;
    }

    public void removeCallbacksAndListeners(){
        handler.removeCallbacks(runnable);
    }

    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        if (mediaPreparedListener != null) {
            mediaPreparedListener.onMediaPrepared(mediaPlayer);
        }
        mediaPlayer.start();
        handler.postDelayed(runnable, INTERVAL);
    }

    @Override
    public void onCompletion(MediaPlayer mediaPlayer) {
        visualizerBar.updatePlayerPercent(0);
        handler.removeCallbacks(runnable);
    }

    public int getDuration() {
        return audioPlayer.getDuration();
    }

    public void seekTo(int position) {
        audioPlayer.seekTo(position);
    }

    public void stopAudioPlayer(){
        audioPlayer.stop();
    }

    public void pauseAudioPlayer(){
        audioPlayer.pause();
    }

    public void startAudioPlayer(){
        audioPlayer.start();
    }

    public boolean isAudioPlaying(){
        return audioPlayer.isPlaying();
    }

    public void releaseAudioPlayer(){
        audioPlayer.release();
    }

    public void resetAudioPlayer(){
        audioPlayer.reset();
    }

    public AudioPlayer getAudioPlayer() {
        return audioPlayer;
    }
}
