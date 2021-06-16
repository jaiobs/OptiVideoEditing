package com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.rn;


import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import static com.litpic.litpicsdkdroid.config.Constants.CROP_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_DETAILS;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

public class ScrollablePlayerManager extends SimpleViewManager<ScrollablePlayerPreview> {

    private ThemedReactContext reactContext;

    @NonNull
    @Override
    public String getName() {
        return "ScrollableVideoPlayer";
    }

    @NonNull
    @Override
    protected ScrollablePlayerPreview createViewInstance(@NonNull ThemedReactContext reactContext) {
        this.reactContext = reactContext;
        return new ScrollablePlayerPreview(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = VIDEO_PATH)
    public void setVideoPath(ScrollablePlayerPreview preview, String videoPath) {
        preview.setVideoPath(videoPath);
        preview.setVideoDetails(MediaUtils.getVideoDetails(reactContext, videoPath));
    }

    /**
     * set video details object
     *
     * @param details - video details
     */
    @ReactProp(name = VIDEO_DETAILS)
    public void setVideoDetails(ScrollablePlayerPreview preview, ReadableMap details) {
        Log.d("@@@","setVideoDetails - > "+details);
    }

    /**
     * set video details object
     *
     * @param xPosition - cropper position on screen
     */
    @ReactProp(name = CROP_POSITION)
    public void setCropPosition(ScrollablePlayerPreview preview, int xPosition) {
        Log.d("@@@","setCropPosition - > "+xPosition);
    }
}
