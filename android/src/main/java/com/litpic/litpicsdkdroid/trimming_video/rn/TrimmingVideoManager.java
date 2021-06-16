package com.litpic.litpicsdkdroid.trimming_video.rn;


import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.trimming_video.view.TrimmingVideoView;

import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_DETAILS;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

public class TrimmingVideoManager extends ViewGroupManager<TrimmingVideoView> {
    @NonNull
    @Override
    public String getName() {
        return "Trimming_Video";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected TrimmingVideoView createViewInstance(
            @NonNull ThemedReactContext reactContext) {
        return new TrimmingVideoView(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = VIDEO_PATH)
    public void setVideoPath(TrimmingVideoView preview, String videoPath) {
        preview.setVideoPath(videoPath);
    }

    /**
     * set video details object
     *
     * @param details- video details
     */
    @ReactProp(name = VIDEO_DETAILS)
    public void setVideoDetails(TrimmingVideoView preview, ReadableArray details) {
        preview.setVideoDetails(details);
    }
}
