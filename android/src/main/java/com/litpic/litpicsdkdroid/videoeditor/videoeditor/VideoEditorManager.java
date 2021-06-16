package com.litpic.litpicsdkdroid.videoeditor.videoeditor;

import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import static com.litpic.litpicsdkdroid.config.Constants.AUDIO_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ADD_GIF;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ADD_STICKER;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ADD_TEXT_OVERLAY;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_ALIGNMENT;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_BACKGROUND;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_COLOR;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_FONT;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_EXPORT_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_PAUSE_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_PLAY_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_SAVE_VIDEO;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_SHOW_TRANSPARENT_VIEW;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_TAG_USER;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_TOGGLE_SHOW_CROP_PREVIEW;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_TOGGLE_SHOW_TILT_PREVIEW;
import static com.litpic.litpicsdkdroid.config.Constants.RESTORE_OVERLAY;
import static com.litpic.litpicsdkdroid.config.Constants.VIDEO_PATH;

public class VideoEditorManager extends ViewGroupManager<VideoEditor> {

    private ThemedReactContext reactContext;

    @NonNull
    @Override
    public String getName() {
        return "VideoEditorAndroid";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected VideoEditor createViewInstance(@NonNull ThemedReactContext reactContext) {
        this.reactContext = reactContext;
        return new VideoEditor(reactContext);
    }

    /**
     * Set video path
     */
    @ReactProp(name = VIDEO_PATH)
    public void setVideoPath(VideoEditor videoEditor, String videoPath) {
        videoEditor.setVideoPath(Uri.parse(videoPath));
        videoEditor.setVideoDetails(getVideoDetails(videoPath));
    }

    @ReactMethod
    public WritableMap getVideoDetails(final String videoPath) {
        return MediaUtils.getVideoDetails(reactContext, videoPath);
    }

    /**
     * Execute methods when receiving
     *
     * @param root      is root view of camera preview
     * @param commandId is the id of passed command
     * @param args      is the arguments passed
     */
    @Override
    public void receiveCommand(@NonNull VideoEditor root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        switch (commandId) {
            case COMMAND_ADD_TEXT_OVERLAY:
                root.addTextOverLay(null);
                break;
            case COMMAND_CHANGE_TEXT_FONT:
                root.changeFont(args);
                break;
            case COMMAND_CHANGE_TEXT_COLOR:
                root.changeTextColor(args);
                break;
            case COMMAND_CHANGE_TEXT_BACKGROUND:
                root.changeTextBackgroundColor(args);
                break;
            case COMMAND_CHANGE_TEXT_ALIGNMENT:
                root.changeTextAlignment(args);
                break;
            case COMMAND_ADD_STICKER:
                if (args != null) {
                    root.addImageStickerOverlay(args, null);
                }
                break;
            case COMMAND_ADD_GIF:
                if (args != null) {
                    root.addGifStickerOverlay(args, null);
                }
                break;
            case COMMAND_SAVE_VIDEO:
                root.saveVideoToLocal();
                break;
            case COMMAND_TOGGLE_SHOW_CROP_PREVIEW:
                root.toggleShowCropperView();
                break;
            case COMMAND_TOGGLE_SHOW_TILT_PREVIEW:
                root.toggleTiltPreview();
                break;
            case AUDIO_PATH:
                if (args != null) {
                    root.setAudioUrl(args.getString(0));
                }
                break;
            case VIDEO_PATH:
                root.setVideoPath(args);
                break;
            case COMMAND_EXPORT_VIDEO:
                root.exportVideoWithEdits();
                break;
            case COMMAND_TAG_USER:
                if (args != null) {
                    root.tagUserOnVideo(args);
                }
                break;
            case COMMAND_SHOW_TRANSPARENT_VIEW:
                if (args != null) {
                    root.showTagTransparentView(args.getBoolean(0));
                }
                break;
            case RESTORE_OVERLAY:
                if (args != null) {
                    root.setPreviousOverlayData(args);
                }
                break;
            case COMMAND_PLAY_VIDEO:
                root.playVideo();
                break;
            case COMMAND_PAUSE_VIDEO:
                root.pauseVideo();
                break;
            default:
                break;
        }
    }
}

