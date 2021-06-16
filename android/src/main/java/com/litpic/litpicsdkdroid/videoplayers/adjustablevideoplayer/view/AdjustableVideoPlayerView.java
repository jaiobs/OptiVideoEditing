package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.view;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.net.Uri;
import android.util.AttributeSet;
import android.util.Xml;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.playerview.AdjustableVideoPlayer;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;
import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
import static com.litpic.litpicsdkdroid.config.Constants.START_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

@SuppressLint("ViewConstructor")
public class AdjustableVideoPlayerView extends FrameLayout {


    private final ThemedReactContext context;

    private AdjustableVideoPlayer adjustableVideoPlayer;
    private Uri videoPath;
    private ReadableMap videoDetails;


    public AdjustableVideoPlayerView(ThemedReactContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        initViews();
    }

    private void initViews() {
        this.setLayoutParams(new RelativeLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT));
        AttributeSet attributes = Xml.asAttributeSet(getResources().getXml(R.xml.adjustable_video_player_attr));
        adjustableVideoPlayer = new AdjustableVideoPlayer(context, attributes);
        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);
        adjustableVideoPlayer.setLayoutParams(layoutParams);

        if (videoDetails != null) {
            adjustableVideoPlayer.setVideoDetails(videoDetails);
        }

        if (videoPath != null) {
            adjustableVideoPlayer.setVideoPath(videoPath);
        }

        this.addView(adjustableVideoPlayer);
        this.requestLayout();
        lockOrientation();
    }

    private void lockOrientation() {
        if (context != null && context.getCurrentActivity() != null && context.getCurrentActivity().getRequestedOrientation() == ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
            int currentOrientation = getResources().getConfiguration().orientation;
            if (currentOrientation == Configuration.ORIENTATION_LANDSCAPE) {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            }
        }
    }

    @Override
    protected void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        this.removeAllViews();
        initViews();
    }

    public void setVideoPath(Uri videoPath) {
        this.videoPath = videoPath;
        adjustableVideoPlayer.setVideoPath(videoPath);
    }

    public void setVideoDetails(ReadableMap details) {
        this.videoDetails = details;
        adjustableVideoPlayer.setVideoDetails(details);
    }

    public void seekTo(ReadableMap readableArray) {
        adjustableVideoPlayer.seekTo(readableArray.getInt(START_POSITION));
    }

    public void seekTo(int seekTo) {
        adjustableVideoPlayer.seekTo(seekTo);
    }

    public void updatePreviewVideo(ReadableMap readableArray) {
        this.setVideoPath(Uri.parse(readableArray.getString(VIDEO_PATH)));
    }
}
