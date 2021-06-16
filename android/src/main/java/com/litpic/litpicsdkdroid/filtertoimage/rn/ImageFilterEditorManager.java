package com.litpic.litpicsdkdroid.filtertoimage.rn;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.filtertoimage.view.ImageFilterEditorView;

public class ImageFilterEditorManager extends ViewGroupManager<ImageFilterEditorView> {

    @NonNull
    @Override
    public String getName() {
        return "ImageFilterEditor";
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @NonNull
    @Override
    protected ImageFilterEditorView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new ImageFilterEditorView(reactContext);
    }

    @ReactProp(name = Constants.IMAGE_PATH)
    public void setImagePath(ImageFilterEditorView imageFilterEditorView, String imagePath) {
        imageFilterEditorView.setImagePath(imagePath);
    }

    @ReactProp(name = Constants.IMAGE_DETAILS)
    public void setImageDetails(ImageFilterEditorView imageFilterEditorView, ReadableMap imageDetails) {
        Log.d("@@@", "image details" + imageDetails);
    }

    @Override
    public void receiveCommand(@NonNull ImageFilterEditorView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        switch (commandId) {
            case Constants.SWITCH_FILTER:
                if (args != null) {
                    root.switchFilter(args.getMap(0));
                }
                break;
            case Constants.COMMAND_ON_NEXT:
                root.onNext();
                break;
            default:
                break;
        }
    }
}
