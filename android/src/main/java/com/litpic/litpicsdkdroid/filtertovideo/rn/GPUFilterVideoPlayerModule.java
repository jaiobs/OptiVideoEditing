package com.litpic.litpicsdkdroid.filtertovideo.rn;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.litpic.litpicsdkdroid.filtertovideo.view.GPUFilterVideoPlayerView;

public class GPUFilterVideoPlayerModule extends ReactContextBaseJavaModule {

    public GPUFilterVideoPlayerModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "GPUFilterVideoPlayerModule";
    }

    @ReactMethod
    public void seekToPosition(final int viewTag, final ReadableMap readableArray) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final GPUFilterVideoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (GPUFilterVideoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.seekTo(readableArray);
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }

    @ReactMethod
    public void applyFilter(final int viewTag, final ReadableMap readableArray) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final GPUFilterVideoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (GPUFilterVideoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.setFilter(readableArray);
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }

    @ReactMethod
    public void releaseNativeListeners(final int viewTag) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final GPUFilterVideoPlayerView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (GPUFilterVideoPlayerView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.releaseListeners();
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }
}
