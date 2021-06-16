
package com.litpic.litpicsdkdroid.addmusictovideo.rn;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import static com.litpic.litpicsdkdroid.config.Constants.CURRENT_AUDIO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

/**
 * View Manager class to create bridge between React-Native and Native
 */
public class MusicToVideoManager extends ViewGroupManager<com.litpic.litpicsdkdroid.addmusictovideo.custom_view.MusicToVideoView> {
    @NonNull
    @Override
    public String getName() {
        return "MusicToVideo";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected com.litpic.litpicsdkdroid.addmusictovideo.custom_view.MusicToVideoView createViewInstance(
            @NonNull ThemedReactContext reactContext) {
        return new com.litpic.litpicsdkdroid.addmusictovideo.custom_view.MusicToVideoView(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = VIDEO_PATH)
    public void setVideoPath(com.litpic.litpicsdkdroid.addmusictovideo.custom_view.MusicToVideoView preview, String videoPath) {
        preview.setVideoPath(videoPath);
    }

    /**
     * React-Native bridging
     * set Audio path
     *
     * @param preview: preview-object
     * @param audioPath: input-audio-path
     */
    @ReactProp(name = CURRENT_AUDIO_PATH)
    public void setAudioPath(com.litpic.litpicsdkdroid.addmusictovideo.custom_view.MusicToVideoView preview, String audioPath) {
        preview.setAudioPath(audioPath);
    }
}
