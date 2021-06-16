package com.litpic.litpicsdkdroid.finalvideoplayerview;

import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_DETAILS;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

public class VideoPlayerPreviewManager extends SimpleViewManager<VideoPlayerPreview> {

    @NonNull
    @Override
    public String getName() {
        return "VideoPlayerPreview";
    }

    @NonNull
    @Override
    protected VideoPlayerPreview createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new VideoPlayerPreview(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = VIDEO_PATH)
    public void setVideoPath(VideoPlayerPreview preview, String videoPath) {
        preview.setVideoPath(Uri.parse(videoPath));
    }

    /**
     * set video details object
     *
     * @param details video details (width,height,duration,path)
     */
    @ReactProp(name = VIDEO_DETAILS)
    public void setVideoDetails(VideoPlayerPreview preview, ReadableMap details) {
        preview.setVideoDetails(details);
    }
}
