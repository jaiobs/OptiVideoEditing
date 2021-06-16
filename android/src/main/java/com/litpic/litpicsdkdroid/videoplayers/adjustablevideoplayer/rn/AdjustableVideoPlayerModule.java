package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.rn;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.view.AdjustableVideoPlayerView;

public class AdjustableVideoPlayerModule extends ReactContextBaseJavaModule {

    public AdjustableVideoPlayerModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AdjustableVideoPlayerModule";
    }

    @ReactMethod
    public void seekToPosition(final int viewTag, final ReadableMap readableArray) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final AdjustableVideoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (AdjustableVideoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.seekTo(readableArray);
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }

    @ReactMethod
    public void updatePreviewVideo(final int viewTag, final ReadableMap readableArray) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final AdjustableVideoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (AdjustableVideoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.updatePreviewVideo(readableArray);
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }
}