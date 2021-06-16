package com.litpic.litpicsdkdroid.imageview;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import androidx.annotation.NonNull;

import static com.litpic.litpicsdkdroid.config.Constants.CROP_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_DETAILS;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;

public class ImagePreviewManager extends SimpleViewManager<TiltImagePreviewView> {

    @NonNull
    @Override
    public String getName() {
        return "scrollableImageViewAndroid";
    }

    @NonNull
    @Override
    protected TiltImagePreviewView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new TiltImagePreviewView(reactContext);
    }

    @ReactProp(name = IMAGE_PATH)
    public void setImagePath(TiltImagePreviewView preview, String imagePath) {
        preview.setImagePath(imagePath);
    }

    /**
     * set video details object
     *
     * @param xPosition - crop rectangle view position on screen
     */
    @ReactProp(name = CROP_POSITION)
    public void setCropPosition(TiltImagePreviewView preview, int xPosition) {
        preview.setCropPosition(xPosition);
    }

    /**
     * set video details object
     *
     * @param details - image details
     */
    @ReactProp(name = IMAGE_DETAILS)
    public void setImageDetails(TiltImagePreviewView preview, ReadableMap details) {
        preview.setImageDetails(details);
    }
}
