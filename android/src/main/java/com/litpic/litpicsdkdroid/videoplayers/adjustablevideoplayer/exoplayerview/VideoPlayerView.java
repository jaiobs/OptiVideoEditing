package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview;

import android.content.Context;
import android.content.res.Configuration;

import com.google.android.exoplayer2.ui.PlayerView;

public class VideoPlayerView extends PlayerView {

    private int mVideoWidth = 0;
    private int mVideoHeight = 0;
    private int screenWidth;
    private int screenHeight;

    public VideoPlayerView(Context context) {
        super(context);
    }

    public void setVideoWidthAndHeight(int width, int height) {
        mVideoWidth = width;
        mVideoHeight = height;
        screenWidth = getResources().getDisplayMetrics().widthPixels;
        screenHeight = getResources().getDisplayMetrics().heightPixels;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {             // NOSONAR
        if (mVideoWidth > 0 && mVideoHeight > 0) {
            int width = getDefaultSize(mVideoWidth, widthMeasureSpec);
            int height = getDefaultSize(mVideoHeight, heightMeasureSpec);
            if (mVideoWidth > 0 && mVideoHeight > 0) {
                if (mVideoWidth == mVideoHeight) {
                    if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT) {
                        width = screenWidth;
                        height = screenWidth;
                    } else {
                        width = screenHeight;
                        height = screenHeight;
                    }
                } else if (mVideoWidth > mVideoHeight) {
                    height = width * mVideoHeight / mVideoWidth;
                } else {
                    width = height * mVideoWidth / mVideoHeight;
                }
            }
            setMeasuredDimension(width, height);
        }else{
            super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        }
    }
}
