package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.rn;


import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.view.AdjustableVideoPlayerView;

public class AdjustableVideoPlayerManager extends ViewGroupManager<AdjustableVideoPlayerView> {

    public AdjustableVideoPlayerManager(ReactApplicationContext reactContext) {
    }

    @NonNull
    @Override
    public String getName() {
        return "AdjustableVideoPlayer";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected AdjustableVideoPlayerView createViewInstance(
            @NonNull ThemedReactContext reactContext) {
        return new AdjustableVideoPlayerView(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = Constants.VIDEO_PATH)
    public void setVideoPath(AdjustableVideoPlayerView preview, String videoPath) {
        preview.setVideoPath(Uri.parse(videoPath));
    }

    /**
     * set video details object
     *
     * @param details- video details
     */
    @ReactProp(name = Constants.VIDEO_DETAILS)
    public void setVideoDetails(AdjustableVideoPlayerView preview, ReadableMap details) {
        preview.setVideoDetails(details);
    }

    @ReactProp(name = Constants.SEEK_TO)
    public void seekTo(AdjustableVideoPlayerView preview, int seekToPosition) {
        if (seekToPosition >= 0) {
            preview.seekTo(seekToPosition);
        }
    }

}
