package com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.view;

import android.content.Context;
import android.content.res.Configuration;
import android.net.Uri;
import android.util.AttributeSet;
import android.util.Log;
import android.widget.VideoView;

import com.facebook.react.bridge.WritableMap;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_ROTATION;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;


public class ScrollablePlayer extends VideoView {

    private int mVideoWidth = 0;
    private int mVideoHeight = 0;

    private int deviceHeight = 0;


    public ScrollablePlayer(Context context) {
        super(context);
    }

    public ScrollablePlayer(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public ScrollablePlayer(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    public void setVideoURI(Uri uri) {
        super.setVideoURI(uri);
        WritableMap videoDetails = MediaUtils.getVideoDetails(uri.getPath());
        if (videoDetails != null) {
            String height = videoDetails.getString(HEIGHT);
            String width = videoDetails.getString(WIDTH);
            int r = Integer.parseInt(videoDetails.getString(VIDEO_ROTATION));
            String rotation = videoDetails.getString(VIDEO_ROTATION);
            if (rotation != null) {
                r = Integer.parseInt(rotation);
            }
            try {
                if (r == 0) {
                    mVideoHeight = Integer.parseInt(height);
                    mVideoWidth = Integer.parseInt(width);
                } else {
                    mVideoHeight = Integer.parseInt(width);
                    mVideoWidth = Integer.parseInt(height);
                }
            } catch (NumberFormatException e) {
                Log.e("@@@", "video view preview - exception - ", e);
            }
        }
    }


    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = getDefaultSize(mVideoWidth, widthMeasureSpec);
        int height = getDefaultSize(mVideoHeight, heightMeasureSpec);
        if (mVideoWidth > 0 && mVideoHeight > 0 && mVideoWidth > mVideoHeight) {
            //if it is portrait need to assign height as device height else compute scale proportion
            if (getScreenOrientation() == Configuration.ORIENTATION_LANDSCAPE) {
                height = width * mVideoHeight / mVideoWidth;
                setFitsSystemWindows(true);
            } else {
                height = deviceHeight;
            }
        }
        setMeasuredDimension(width, height);
    }

    public void setDeviceHeight(int height) {
        deviceHeight = height;
    }

    private int getScreenOrientation() {
        return getResources().getConfiguration().orientation;
    }
}
