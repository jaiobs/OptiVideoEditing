package com.litpic.litpicsdkdroid.camerapreview.rn;


import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.config.Constants;

import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.CAMARA_ACTION;
import static com.litpic.litpicsdkdroid.config.Constants.FLASH_ON;
import static com.litpic.litpicsdkdroid.config.Constants.LOADER_STATE;
import static com.litpic.litpicsdkdroid.config.Constants.PICKER_STATE;
import static com.litpic.litpicsdkdroid.config.Constants.SWITCH_CAMERA;

public class CameraPreviewManager extends ViewGroupManager<CameraPreviewView> {

    private final ReactApplicationContext reactAppContext;

    public CameraPreviewManager(ReactApplicationContext reactContext) {
        this.reactAppContext = reactContext;
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    public String getName() {
        return "CameraPreviewComponent";
    }

    @NonNull
    @Override
    protected CameraPreviewView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new CameraPreviewView(reactContext, reactAppContext);
    }

    /**
     * Execute methods when receiving
     *
     * @param root      is root view of camera preview
     * @param commandId is the id of passed command
     * @param args      is the arguments passed
     */
    @Override
    public void receiveCommand(@NonNull CameraPreviewView root, String commandId, @androidx.annotation.Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        switch (commandId) {
            case Constants.SWITCH_FILTER:
                root.switchFilter(args);
                break;
            case Constants.CAPTURE_PHOTO:
                root.takePhoto();
                break;
            case Constants.UN_MOUNT_CAMERA:
                root.unMountCamera();
                break;
            case Constants.LOCK_ORIENTATION:
                root.lockOrientation();
                break;
            case Constants.START_VIDEO:
                root.startVideo();
                break;
            case Constants.STOP_VIDEO:
                root.stopVideo();
                break;
            case Constants.SPEED_VALUE:
                root.speedValue(Objects.requireNonNull(args).getString(0));
                break;
            case Constants.AUDIO_PATH:
                root.setAudioFileToPlayer(Objects.requireNonNull(args).getString(0));
                break;
            case Constants.REMOVE_LAST_SEGMENT:
                root.removeLastSegment();
                break;
            case Constants.RELEASE_ORIENTATION:
                root.releaseOrientation();
                break;
            case Constants.SHADOW_IMAGE:
                root.shadowImage(Objects.requireNonNull(args).getString(0));
                break;
            case Constants.RELEASE_LISTENERS:
                root.releaseListeners();
                break;
            default:
                break;
        }
    }

    /**
     * Set flash on or off
     */
    @ReactProp(name = FLASH_ON)
    public void setFlashOn(CameraPreviewView root, boolean flashOn) {
        root.flashOnOff(flashOn);
    }

    /**
     * set camera facing
     */
    @ReactProp(name = SWITCH_CAMERA)
    public void setCameraFacing(CameraPreviewView root, boolean cameraFacing) {
        root.setCameraFacing(cameraFacing);
    }

    /**
     * set camera facing
     */
    @ReactProp(name = CAMARA_ACTION)
    public void setCameraAction(CameraPreviewView root, boolean cameraAction) {
        root.openCamera(cameraAction);
    }

    /**
     * set loader event
     */
    @ReactProp(name = LOADER_STATE)
    public void setLoaderState(CameraPreviewView root, boolean isShowing) {
        root.setLoaderStatus(isShowing);
    }

    /**
     * set music-picker state
     */
    @ReactProp(name = PICKER_STATE)
    public void setMusicPickerState(CameraPreviewView root, boolean isShowing) {
        root.setMusicPickerState(isShowing);
    }
}
