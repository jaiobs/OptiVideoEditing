package com.litpic.litpicsdkdroid.filtertovideo.rn;


import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.filtertovideo.view.GPUFilterVideoPlayerView;

public class GPUFilterVideoPlayerManager extends ViewGroupManager<GPUFilterVideoPlayerView> {

    @NonNull
    @Override
    public String getName() {
        return "GPUFilterVideoPlayerManager";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected GPUFilterVideoPlayerView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new GPUFilterVideoPlayerView(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = Constants.VIDEO_PATH)
    public void setVideoPath(GPUFilterVideoPlayerView preview, String videoPath) {
        preview.setVideoPath(videoPath);
    }

    /**
     * set video details object
     *
     * @param details- video details
     */
    @ReactProp(name = Constants.VIDEO_DETAILS)
    public void setVideoDetails(GPUFilterVideoPlayerView preview, ReadableMap details) {
        preview.setVideoDetails(details);
    }

    @ReactProp(name = Constants.SEEK_TO)
    public void seekTo(GPUFilterVideoPlayerView preview, int seekToPosition) {
        if (seekToPosition >= 0) {
            preview.seekTo(seekToPosition);
        }
    }

	/**
	 * @param isProcessing true when video processed with ffmpeg
	 */
    @ReactProp(name = Constants.LOADER_STATE)
    public void isVideoProcessing(GPUFilterVideoPlayerView preview, Boolean isProcessing) {
	    preview.setPlayerState(isProcessing);
    }
}
