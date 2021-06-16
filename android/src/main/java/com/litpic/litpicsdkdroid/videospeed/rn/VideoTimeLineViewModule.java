package com.litpic.litpicsdkdroid.videospeed.rn;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class VideoTimeLineViewModule extends ReactContextBaseJavaModule {

    public VideoTimeLineViewModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "VideoTimeLineViewModule";
    }
}
