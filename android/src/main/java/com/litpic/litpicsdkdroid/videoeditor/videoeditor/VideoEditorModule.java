package com.litpic.litpicsdkdroid.videoeditor.videoeditor;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;

public class VideoEditorModule extends ReactContextBaseJavaModule {

    public VideoEditorModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "VideoEditorViewModule";
    }


    /**
     * trim video
     *
     * @param viewTag  -
     * @param callback js callback to return values
     */
    @ReactMethod
    public void nextClicked(final int viewTag, final Callback callback) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final VideoEditor videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (VideoEditor) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.nextClicked(callback);
                } catch (Exception e) {
                    Log.d("@@@", "Exception - ", e);
                }
            }
        });
    }

    /**
     * getOverlayDataArray
     *
     * @param viewTag  -
     * @param callback js callback to return values
     */
    @ReactMethod
    public void getOverlayDataArray(final int viewTag, final Callback callback) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final VideoEditor videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (VideoEditor) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.getOverlayItemsList(callback);
                } catch (Exception e) {
                    Log.d("@@@", "Exception - ", e);
                }
            }
        });
    }
}
