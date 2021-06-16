package com.litpic.litpicsdkdroid.trimmermodule.view;

import android.content.Context;
import android.content.res.Configuration;
import android.net.Uri;
import android.util.AttributeSet;
import android.widget.VideoView;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;

public class VideoViewPreview extends VideoView {

    private int mVideoWidth = 0;
    private int mVideoHeight = 0;
    private boolean isLandscape = false;
    private int screenWidth;
    private int screenHeight;

    private SizeListener sizeListener;


    public VideoViewPreview(Context context) {
        super(context);
    }

    public VideoViewPreview(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public VideoViewPreview(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public void setSizeListener(SizeListener listener) {
        this.sizeListener = listener;
    }

    public interface SizeListener {
        void onSizeChanged(int width, int height);
    }

    public void setVideoURI(ThemedReactContext context, Uri uri) {
        this.setVideoURI(uri);
        WritableMap videoDetails = MediaUtils.getVideoDetails(uri.getPath());
        if (videoDetails != null) {
            String height = videoDetails.getString(HEIGHT);
            String width = videoDetails.getString(WIDTH);
            boolean isRotated = MediaUtils.isAnamorphic(context, uri.toString());
            if (isRotated) {
                mVideoHeight = Integer.parseInt(height);
                mVideoWidth = Integer.parseInt(width);
            } else {
                mVideoHeight = Integer.parseInt(width);
                mVideoWidth = Integer.parseInt(height);
            }
        }

        if (mVideoWidth > 0 && mVideoHeight > 0) {
            isLandscape = mVideoWidth > mVideoHeight;
        }
        screenWidth = getResources().getDisplayMetrics().widthPixels;
        screenHeight = getResources().getDisplayMetrics().heightPixels;
        requestLayout();
    }

    @Override
    public void setVideoURI(Uri uri) {
        super.setVideoURI(uri);
    }

    public boolean isLandscape() {
        return isLandscape;
    }


    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
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
        sizeListener.onSizeChanged(width, height);
        setMeasuredDimension(width, height);
    }

    public int getVideoWidth() {
        return getWidth();
    }

    public int getVideoHeight() {
        return getHeight();
    }

    public float getVideoX() {
        int[] pos = new int[2];
        getLocationOnScreen(pos);
        return pos[0];

    }

    public float getVideoY() {
        int[] pos = new int[2];
        getLocationOnScreen(pos);
        return pos[1];
    }

}