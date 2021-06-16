package com.litpic.litpicsdkdroid.audiotrimming.reactnative;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.audiotrimming.AudioTrimmerView;
import com.litpic.litpicsdkdroid.config.Constants;

import static com.litpic.litpicsdkdroid.config.Constants.AUTHOR;
import static com.litpic.litpicsdkdroid.config.Constants.AVATAR;
import static com.litpic.litpicsdkdroid.config.Constants.TITLE;
import static com.litpic.litpicsdkdroid.config.Constants.TRACK_URL;

/**
 * View Manager class to create bridge between React-Native and Native
 */
public class AudioTrimmerManager extends ViewGroupManager<AudioTrimmerView> {

    private final ReactApplicationContext reactAppContext;

    @NonNull
    @Override
    public String getName() {
        return "AudioTrimmerDroid";
    }

    public AudioTrimmerManager(ReactApplicationContext reactContext) {
        this.reactAppContext = reactContext;
    }

    @NonNull
    @Override
    protected AudioTrimmerView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new AudioTrimmerView(reactContext, reactAppContext);
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }


    /**
     * Execute methods when receiving
     *
     * @param root      is root view of camera preview
     * @param commandId is the id of passed command
     * @param args      is the arguments passed
     */
    @Override
    public void receiveCommand(@NonNull AudioTrimmerView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        if (commandId.equals(Constants.COMMAND_ON_BACK_PRESSED)) {
            root.exitView();
        } else if (commandId.equals(Constants.RELEASE_LISTENERS)) {
            root.releaseListeners();
        }
    }

    /**
     * Set video path
     */
    @ReactProp(name = TITLE)
    public void setAudioTitle(AudioTrimmerView trimmerView, String title) {
        trimmerView.setTitle(title);
    }

    /**
     * Set video path
     */
    @ReactProp(name = AUTHOR)
    public void setAuthor(AudioTrimmerView trimmerView, String author) {
        trimmerView.setAuthor(author);
    }

    /**
     * Set video path
     */
    @ReactProp(name = AVATAR)
    public void setAudioAvatar(AudioTrimmerView trimmerView, String avatar) {
        trimmerView.setAvatar(avatar);
    }

    /**
     * Set video path
     */
    @ReactProp(name = TRACK_URL)
    public void setTrackUrl(AudioTrimmerView trimmerView, String trackPath) {
        trimmerView.setTrackPath(trackPath);
    }
}
