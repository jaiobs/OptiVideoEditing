package com.litpic.litpicsdkdroid.gallerypicker;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class GalleryPickerModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext context;

    private static final String IMAGE_TYPE = "image";

    private static final String VIDEO_TYPE = "video";

    private static final String GALLERY_IMAGES = "gallery_images";
    private static final String GALLERY_VIDEOS = "gallery_videos";

    public GalleryPickerModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "GalleryPickerModule";
    }


    @ReactMethod
    public void getGalleryImages(final Callback callback) {
        GetGalleryAsyncTask getGalleryAsyncTask = new GetGalleryAsyncTask(context.getCurrentActivity(), IMAGE_TYPE, false, new GetGalleryAsyncTask.GetGalleryListener() {
            @Override
            public void getGalleryList(String json) {
                WritableMap dataMap = Arguments.createMap();
                dataMap.putString(GALLERY_IMAGES, json);
                callback.invoke(dataMap);
            }
        });

        getGalleryAsyncTask.execute();
    }

    @ReactMethod
    public void getGalleyVideos(final Callback callback) {
        GetGalleryAsyncTask getGalleryAsyncTask = new GetGalleryAsyncTask(context.getCurrentActivity(), VIDEO_TYPE, false, new GetGalleryAsyncTask.GetGalleryListener() {
            @Override
            public void getGalleryList(String json) {
                WritableMap dataMap = Arguments.createMap();
                dataMap.putString(GALLERY_VIDEOS, json);
                callback.invoke(dataMap);
            }
        });

        getGalleryAsyncTask.execute();
    }

}
