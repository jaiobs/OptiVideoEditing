package com.litpic.litpicsdkdroid.camerapreview.rn;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import org.jetbrains.annotations.NotNull;

import static com.litpic.litpicsdkdroid.config.Constants.CROP_POSITION;
import static com.litpic.litpicsdkdroid.config.Constants.X;
import static com.litpic.litpicsdkdroid.config.Constants.Y;

public class CameraModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public CameraModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NotNull
    @Override
    public String getName() {
        return "CameraModuleAndroid";
    }

    /**
     * get video details
     *
     * @param videoPath input video location in storage
     */
    @ReactMethod
    public void getVideoDetails(final String videoPath,
                                final Callback callback) {

        WritableMap dataMap = MediaUtils.getVideoDetails(reactContext, videoPath);
        WritableMap cropMap = Arguments.createMap();
        cropMap.putInt(X, 0);
        cropMap.putInt(Y, 0);
        dataMap.putMap(CROP_POSITION, cropMap);

        callback.invoke(dataMap);
    }

    /**
     * get image details
     *
     * @param imagePath input image file location in storage
     */
    @ReactMethod
    public void getImageDetails(String imagePath, final Callback callback) {

        callback.invoke(MediaUtils.getImageDetails(imagePath));
    }

    /**
     * method will save the video file from the cache to external storage memory
     *
     * @param callback  js call back to pass results
     * @param videoPath input video file location in storage
     */
    @ReactMethod
    private void saveVideoLocal(String videoPath, Callback callback) {
        try {
            FileUtils utils = new FileUtils();
            utils.saveVideoLocal(callback, videoPath, reactContext);
        } catch (Exception e) {
            Log.d("@@@", "Exception - ", e);
        }
    }

    /**
     * method will save the image file from the cache to external storage memory
     *
     * @param callback  js callback to pass results
     * @param imagePath input image file location in storage
     */
    @ReactMethod
    private void saveImageLocal(String imagePath, Callback callback) {
        try {
            FileUtils utils = new FileUtils();
            utils.saveImageLocal(callback, imagePath, reactContext);
        } catch (Exception e) {
            Log.d("@@@", "Exception - ", e);
        }
    }

}
