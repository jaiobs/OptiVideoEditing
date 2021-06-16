package com.litpic.litpicsdkdroid;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.litpic.litpicsdkdroid.addmusictovideo.rn.MusicToVideoManager;
import com.litpic.litpicsdkdroid.audiotrimming.reactnative.AudioTrimmerManager;
import com.litpic.litpicsdkdroid.camerapreview.rn.CameraModule;
import com.litpic.litpicsdkdroid.camerapreview.rn.CameraPreviewManager;
import com.litpic.litpicsdkdroid.ffmpeg.reactnative.FfmpegProcessModule;
import com.litpic.litpicsdkdroid.filtertoimage.rn.ImageFilterEditorManager;
import com.litpic.litpicsdkdroid.filtertoimage.rn.ImageFilterEditorModule;
import com.litpic.litpicsdkdroid.filtertovideo.rn.GPUFilterVideoPlayerManager;
import com.litpic.litpicsdkdroid.filtertovideo.rn.GPUFilterVideoPlayerModule;
import com.litpic.litpicsdkdroid.finalvideoplayerview.VideoPlayerPreviewManager;
import com.litpic.litpicsdkdroid.gallerypicker.GalleryPickerModule;
import com.litpic.litpicsdkdroid.imageeditor.rn.ImageEditorManager;
import com.litpic.litpicsdkdroid.imageeditor.rn.ImageEditorViewModule;
import com.litpic.litpicsdkdroid.imageview.ImagePreviewManager;
import com.litpic.litpicsdkdroid.streamingaudioplayer.StreamingAudioPlayerModule;
import com.litpic.litpicsdkdroid.trimming_video.rn.TrimmingVideoManager;
import com.litpic.litpicsdkdroid.trimming_video.rn.TrimmingVideoModule;
import com.litpic.litpicsdkdroid.utils.FileUtils;
import com.litpic.litpicsdkdroid.videoeditor.videoeditor.VideoEditorManager;
import com.litpic.litpicsdkdroid.videoeditor.videoeditor.VideoEditorModule;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.rn.AdjustableExoVideoPlayerManager;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.rn.AdjustableGlExoVideoPlayerModule;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.rn.AdjustableVideoPlayerManager;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.rn.AdjustableVideoPlayerModule;
import com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.rn.ScrollablePlayerManager;
import com.litpic.litpicsdkdroid.videospeed.rn.VideoTimeLineViewManager;
import com.litpic.litpicsdkdroid.videospeed.rn.VideoTimeLineViewModule;

import java.util.Arrays;
import java.util.List;

/**
 * React-Native bridging
 */
public class LitpicSdkPackages implements ReactPackage {


    /**
     * @param reactContext: react-native context
     * @return list of implemented native modules
     */
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        FileUtils.clearMediaCache(reactContext);
        return Arrays.<NativeModule>asList(new FfmpegProcessModule(reactContext),
                new CameraModule(reactContext), new AdjustableVideoPlayerModule(reactContext),
                new AdjustableGlExoVideoPlayerModule(reactContext),
                new GalleryPickerModule(reactContext), new VideoEditorModule(reactContext),
                new ImageEditorViewModule(reactContext), new StreamingAudioPlayerModule(reactContext),
                new VideoTimeLineViewModule(reactContext), new TrimmingVideoModule(reactContext),
                new ImageFilterEditorModule(reactContext), new GPUFilterVideoPlayerModule(reactContext));
    }

    /**
     * @param reactContext: react-native context
     * @return listof custom view-managers
     */
    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(new CameraPreviewManager(reactContext),
                new AdjustableVideoPlayerManager(reactContext),
                new AdjustableExoVideoPlayerManager(reactContext), new ScrollablePlayerManager(),
                new ImagePreviewManager(), new VideoPlayerPreviewManager(),
                new VideoEditorManager(), new ImageEditorManager(),
                new AudioTrimmerManager(reactContext), new VideoTimeLineViewManager(),
                new TrimmingVideoManager(), new MusicToVideoManager(), new ImageFilterEditorManager(),
                new GPUFilterVideoPlayerManager());
    }
}
