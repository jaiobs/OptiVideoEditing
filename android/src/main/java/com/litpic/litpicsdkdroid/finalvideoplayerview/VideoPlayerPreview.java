package com.litpic.litpicsdkdroid.finalvideoplayerview;

import android.annotation.SuppressLint;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.trimmermodule.view.VideoViewPreview;


@SuppressLint("ViewConstructor")
public class VideoPlayerPreview extends FrameLayout {

    private final ThemedReactContext context;
    private VideoViewPreview mVideoView;
    private Uri mSrc;
    private RelativeLayout mLinearVideo;

    public VideoPlayerPreview(@NonNull ThemedReactContext context) {
        super(context);
        this.context = context;
        init();
    }

    private void init() {
        LayoutInflater.from(context).inflate(R.layout.adjustable_video_player, this, true);

        mVideoView = findViewById(R.id.adjustable_video_view);
        mVideoView = findViewById(R.id.adjustable_video_view);

        if (mSrc != null && mVideoView != null) {
            mVideoView.setVideoURI(mSrc);
            mVideoView.requestFocus();
            mVideoView.start();
        }
        setUpListeners();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        if (mVideoView.isPlaying()) {
            mVideoView.stopPlayback();
        }
    }

    private void setUpListeners() {
        mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                onVideoPrepared(mp);
            }
        });
    }

    private void onVideoPrepared(@NonNull MediaPlayer mp) {
        // Adjust the size of the video
        // so it fits on the screen
        int videoWidth = mp.getVideoWidth();
        int videoHeight = mp.getVideoHeight();
        float videoProportion = (float) videoWidth / (float) videoHeight;
        int screenWidth = mLinearVideo.getWidth();
        int screenHeight = mLinearVideo.getHeight();
        float screenProportion = (float) screenWidth / (float) screenHeight;
        ViewGroup.LayoutParams lp = mVideoView.getLayoutParams();

        if (videoProportion > screenProportion) {
            lp.width = screenWidth;
            lp.height = (int) ((float) screenWidth / videoProportion);
        } else {
            lp.width = (int) (videoProportion * (float) screenHeight);
            lp.height = screenHeight;
        }

        mVideoView.setLayoutParams(lp);

        mp.start();
        mp.setLooping(true);

    }

    public void setVideoDetails(ReadableMap details) {
        Log.d("@@@","setVideoDetails - "+details);
    }

    public void setVideoPath(Uri videoPath) {
        mSrc = videoPath;
        if (mVideoView != null && mSrc != null) {
            initVideoView();
        }
    }

    private void initVideoView() {
        if (mSrc != null && mVideoView != null) {
            mVideoView.stopPlayback();
            mVideoView.setVideoURI(mSrc);
            mVideoView.requestFocus();
        }
    }
}
