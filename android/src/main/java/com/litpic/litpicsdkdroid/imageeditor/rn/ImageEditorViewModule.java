package com.litpic.litpicsdkdroid.imageeditor.rn;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class ImageEditorViewModule extends ReactContextBaseJavaModule {

    public ImageEditorViewModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "ImageEditorViewModule";
    }
}

