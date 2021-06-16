package com.litpic.litpicsdkdroid.trimming_video.rn;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.litpic.litpicsdkdroid.trimming_video.view.TrimmingVideoView;

public class TrimmingVideoModule extends ReactContextBaseJavaModule {

    public TrimmingVideoModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "Trimming_VideoModule";
    }


    /**
     * trim video
     *
     * @param viewTag -
     * @param callback js callback to return value
     */
    @ReactMethod
    public void trimVideo(final int viewTag, final Callback callback) {

        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final TrimmingVideoView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (TrimmingVideoView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.trimVideo(callback);
                }
                catch (Exception e) {
                    Log.d("@@@","trim video - exception ",e);
                }
            }
        });
    }

    @ReactMethod
    public void addVideoToTrimmer(final int viewTag, final ReadableArray videos) {
        ReactApplicationContext context = getReactApplicationContext();
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                final TrimmingVideoView trimmingVideoView;
                try {
                    trimmingVideoView =
                            (TrimmingVideoView) nativeViewHierarchyManager.resolveView(viewTag);
                    trimmingVideoView.addVideos(videos);
                }
                catch (Exception e) {
                    Log.d("@@@","add video to trimmer - exception ",e);
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
                final TrimmingVideoView videoTrimmerPreview;
                try {
                    videoTrimmerPreview =
                            (TrimmingVideoView) nativeViewHierarchyManager.resolveView(viewTag);
                    videoTrimmerPreview.setFilter(readableArray);
                } catch (Exception e) {
                    Log.d("@@@", "exception - " + e.getLocalizedMessage());
                }
            }
        });
    }
}







