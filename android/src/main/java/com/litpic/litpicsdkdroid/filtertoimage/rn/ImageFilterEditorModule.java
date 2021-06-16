package com.litpic.litpicsdkdroid.filtertoimage.rn;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class ImageFilterEditorModule extends ReactContextBaseJavaModule {

    public ImageFilterEditorModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "ImageFilterEditorModule";
    }
}
