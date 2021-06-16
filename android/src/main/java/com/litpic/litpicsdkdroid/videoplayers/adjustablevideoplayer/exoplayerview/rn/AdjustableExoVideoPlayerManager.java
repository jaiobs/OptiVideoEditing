package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.rn;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.AdjustableExoPlayerView;

public class AdjustableExoVideoPlayerManager extends ViewGroupManager<AdjustableExoPlayerView> {

    public AdjustableExoVideoPlayerManager(ReactApplicationContext reactContext) {
        this.reactAppContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "AdjustableExoVideoPlayer";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    private final ReactApplicationContext reactAppContext;

    @NonNull
    @Override
    protected AdjustableExoPlayerView createViewInstance(
            @NonNull ThemedReactContext reactContext) {
        return new AdjustableExoPlayerView(reactContext, reactAppContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = Constants.VIDEO_PATH)
    public void setVideoPath(AdjustableExoPlayerView preview, String videoPath) {
        preview.setVideoPath(videoPath);
    }

    /**
     * set video details object
     *
     * @param details- video details
     */
    @ReactProp(name = Constants.VIDEO_DETAILS)
    public void setVideoDetails(AdjustableExoPlayerView preview, ReadableMap details) {
        preview.setVideoDetails(details);
    }

    @ReactProp(name = Constants.SEEK_TO)
    public void seekTo(AdjustableExoPlayerView preview, int seekToPosition) {
        if (seekToPosition >= 0) {
            preview.seekTo(seekToPosition);
        }
    }

    @ReactProp(name = Constants.RELEASE_LISTENERS)
    public void releaseListener(AdjustableExoPlayerView preview, boolean isRemoveListener) {
        if (isRemoveListener) {
            preview.releaseLifeCycleListener();
        }
    }

	/**
	 * @param isProcessing true when video processed with ffmpeg
	 */
	@ReactProp(name = Constants.LOADER_STATE)
	public void isVideoProcessing(AdjustableExoPlayerView preview, Boolean isProcessing) {
		preview.setVideoProcessingStatus(isProcessing);
	}
}
