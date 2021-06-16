package com.litpic.litpicsdkdroid.videospeed.rn;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.videospeed.view.VideoTimeLineView;

import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ON_NEXT;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_SAVE_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_DURATION;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

public class VideoTimeLineViewManager extends ViewGroupManager<VideoTimeLineView> {

    @NonNull
    @Override
    public String getName() {
        return "VideoTimeLineView";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected VideoTimeLineView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new VideoTimeLineView(reactContext);
    }

    /**
     * Execute methods when receiving
     *
     * @param root      is root view of camera preview
     * @param commandId is the id of passed command
     * @param args      is the arguments passed
     */
    @Override
    public void receiveCommand(@NonNull VideoTimeLineView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        switch (commandId) {
            case COMMAND_SAVE_VIDEO:
                root.saveVideo();
                break;
            case COMMAND_ON_NEXT:
                root.onNextClicked(Objects.requireNonNull(args));
                break;
            default:
                break;
        }
    }

    /**
     * Set video path
     */
    @ReactProp(name = VIDEO_PATH)
    public void setVideoPath(VideoTimeLineView preview, String videoPath) {
        preview.setVideoPath(videoPath);
    }

    /**
     * Set video duration
     */
    @ReactProp(name = VIDEO_DURATION)
    public void setDuration(VideoTimeLineView preview, int duration) {
        preview.setDuration(duration);
    }
}
