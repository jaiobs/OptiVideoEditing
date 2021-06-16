package com.litpic.litpicsdkdroid.imageeditor.rn;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.imageeditor.view.ImageEditor;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ADD_GIF;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ADD_STICKER;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_ADD_TEXT_OVERLAY;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_ALIGNMENT;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_BACKGROUND;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_COLOR;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CHANGE_TEXT_FONT;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_CLOSE_PRESSED;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_EXPORT_IMAGE;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_SAVE_IMAGE;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_SHOW_TRANSPARENT_VIEW;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_TAG_USER;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_TOGGLE_SHOW_CROP_PREVIEW;
import static com.litpic.litpicsdkdroid.config.Constants.COMMAND_TOGGLE_SHOW_TILT_PREVIEW;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.RELEASE_LISTENERS;

public class ImageEditorManager extends ViewGroupManager<ImageEditor> {

    @NonNull
    @Override
    public String getName() {
        return "ImageEditorAndroid";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected ImageEditor createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new ImageEditor(reactContext);
    }

    @ReactProp(name = IMAGE_PATH)
    public void setImagePath(ImageEditor editor, String imagePath) {
        editor.setImagePath(imagePath);
        editor.setImageDetails(Objects.requireNonNull(MediaUtils.getImageDetails(imagePath)));
    }

    /**
     * Execute methods when receiving
     *
     * @param root      is root view of camera preview
     * @param commandId is the id of passed command
     * @param args      is the arguments passed
     */
    @Override
    public void receiveCommand(@NonNull ImageEditor root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        switch (commandId) {
            case COMMAND_ADD_TEXT_OVERLAY:
                root.addTextOverLay();
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
                root.addImageStickerOverlay(args);
                break;
            case COMMAND_ADD_GIF:
                root.addGifStickerOverlay(Objects.requireNonNull(args));
                break;
            case COMMAND_SAVE_IMAGE:
                root.saveImageToLocal();
                break;
            case COMMAND_TOGGLE_SHOW_CROP_PREVIEW:
                root.toggleShowCropperView();
                break;
            case COMMAND_TOGGLE_SHOW_TILT_PREVIEW:
                root.toggleTiltPreview();
                break;
            case Constants.AUDIO_PATH:
                if (args != null) {
                    root.setAudioUrl(args.getString(0));
                }
                break;
            case COMMAND_EXPORT_IMAGE:
                root.exportImageWithEdits();
                break;
            case COMMAND_TAG_USER:
                if (args != null) {
                    root.addTagView(args);
                }
                break;
            case COMMAND_SHOW_TRANSPARENT_VIEW:
                if (args != null) {
                    root.showTagTransparentView(args.getBoolean(0));
                }
                break;
            case COMMAND_CLOSE_PRESSED:
                root.onClosePressed();
                break;
            case RELEASE_LISTENERS:
                root.releaseListeners();
                break;
            default:
                break;
        }
    }
}
