package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.rn;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.AdjustableExoPlayerView;

public class AdjustableGlExoVideoPlayerModule extends ReactContextBaseJavaModule {

    public AdjustableGlExoVideoPlayerModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AdjustableExoVideoPlayerModule";
    }

    @ReactMethod
    public void seekToPosition(final int viewTag, final ReadableMap readableArray) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final AdjustableExoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (AdjustableExoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
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
                final AdjustableExoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (AdjustableExoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.updatePreviewVideo(readableArray);
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }

    @ReactMethod
    public void releaseListeners(final int viewTag) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final AdjustableExoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (AdjustableExoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.releaseLifeCycleListener();
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }
}
