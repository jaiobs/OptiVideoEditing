package com.litpic.litpicsdkdroid.filtertoimage.view;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.imageeditor.customview.CustomImageView;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jp.co.cyberagent.android.gpuimage.GPUImageView;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageBrightnessFilter;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageContrastFilter;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageFilter;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageFilterGroup;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageGrayscaleFilter;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageMonochromeFilter;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageSepiaToneFilter;
import jp.co.cyberagent.android.gpuimage.filter.GPUImageZoomBlurFilter;
import jp.co.cyberagent.android.gpuimage.util.Rotation;

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;
import static com.litpic.litpicsdkdroid.config.Constants.BRIGHTNESS;
import static com.litpic.litpicsdkdroid.config.Constants.CONTRAST;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_NEXT_CLICKED;
import static com.litpic.litpicsdkdroid.config.Constants.EVENT_PROGRESS;
import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_DETAILS;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_PATH;
import static com.litpic.litpicsdkdroid.config.Constants.IMAGE_WIDTH;
import static com.litpic.litpicsdkdroid.config.Constants.SATURATION;
import static com.litpic.litpicsdkdroid.config.Constants.SHOW_LOADER;
import static com.litpic.litpicsdkdroid.config.Constants.TYPE;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;

@SuppressLint("ViewConstructor")
public class ImageFilterEditorView extends FrameLayout {

    private final ThemedReactContext context;
    private String imagePath = "";
    private int imageHeight;
    private int imageWidth;
    private GPUImageView gpuImageView;

    public ImageFilterEditorView(ThemedReactContext context) {
        super(context);
        this.context = context;
        initView();
    }

    private void initView() {
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                MATCH_PARENT, MATCH_PARENT,
                Gravity.CENTER);
        this.setLayoutParams(params);
        gpuImageView = new GPUImageView(context);
        if (!TextUtils.isEmpty(imagePath)) {
            gpuImageView.setImage(Uri.parse(imagePath));
            if (MediaUtils.isAnamorphic(imagePath)) {
                gpuImageView.setRotation(Rotation.ROTATION_90);
            }
        }

        addView(gpuImageView);
        this.requestLayout();
        lockOrientation();
    }

    public void switchFilter(ReadableMap filterMap) {
        if (filterMap == null) return;

        float contrast = 0.0f;
        float brightness = 0.0f;
        String filterType = Objects.requireNonNull(filterMap).getString(TYPE);
        if (filterMap.hasKey(CONTRAST) && filterMap.hasKey(BRIGHTNESS) && filterMap.hasKey(
                SATURATION)) {
            contrast = (float) filterMap.getDouble(CONTRAST);
            brightness = (float) filterMap.getDouble(BRIGHTNESS);
        }

        GPUImageFilter currentFilter;
        switch (Objects.requireNonNull(filterType)) {
            case Constants.CSB:
                List<GPUImageFilter> filters = new ArrayList<>();
                filters.add(new GPUImageContrastFilter(contrast));
                filters.add(new GPUImageBrightnessFilter(brightness));
                currentFilter = new GPUImageFilterGroup(filters);
                break;
            case Constants.GREY_SCALE:
                currentFilter = new GPUImageGrayscaleFilter();
                break;
            case Constants.SEPIA:
                currentFilter = new GPUImageSepiaToneFilter();
                break;
            case Constants.MONOCHROME:
                currentFilter = new GPUImageMonochromeFilter();
                break;
            case Constants.BLUR:
                currentFilter = new GPUImageZoomBlurFilter();
                break;
            default:
                currentFilter = new GPUImageFilter();
                break;
        }

        gpuImageView.setFilter(currentFilter);
    }


    private void lockOrientation() {
        if (imageHeight > imageWidth) {
            context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        }
        if (context.getCurrentActivity() != null && context.getCurrentActivity().getRequestedOrientation() == ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
            int currentOrientation = getResources().getConfiguration().orientation;
            if (currentOrientation == Configuration.ORIENTATION_LANDSCAPE) {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            }
        }
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
        if (gpuImageView != null) {
            gpuImageView.setImage(Uri.parse(imagePath));
        }
        setImageDetails(MediaUtils.getImageDetails(imagePath));
    }

    public void setImageDetails(ReadableMap details) {
        if (MediaUtils.isAnamorphic(imagePath)) {
            imageWidth = details.getInt(HEIGHT);
            imageHeight = details.getInt(WIDTH);
        } else {
            imageWidth = details.getInt(WIDTH);
            imageHeight = details.getInt(HEIGHT);
        }
        if (gpuImageView != null && MediaUtils.isAnamorphic(imagePath)) {
            gpuImageView.setRotation(Rotation.ROTATION_90);
        }
        lockOrientation();
    }

    public void onNext() {
        String outputPath;
        try {
            outputPath = MediaUtils.saveBitmapAsJPEGToCache(context, gpuImageView.capture());
        } catch (InterruptedException e) {
            Log.d("@@@", "execption - ", e);
            outputPath = imagePath;
            Thread.currentThread().interrupt();
        }
        WritableMap params = Arguments.createMap();
        params.putString(IMAGE_PATH, outputPath);
        WritableMap map = MediaUtils.getImageDetails(outputPath);
        params.putInt(IMAGE_HEIGHT, map.getInt(HEIGHT));
        params.putInt(IMAGE_WIDTH, map.getInt(WIDTH));
        params.putMap(IMAGE_DETAILS, map);
        sendEvent(context, params, EVENT_NEXT_CLICKED);
    }

    public void showOrHideJsLoader(boolean showLoader) {
        WritableMap params = Arguments.createMap();
        params.putBoolean(SHOW_LOADER, showLoader);
        sendEvent(context, params, EVENT_PROGRESS);
    }

    private void sendEvent(ThemedReactContext reactContext, @Nullable WritableMap params,
                           String eventName) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                eventName, params);
    }

    void setupLayoutHack() {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren();
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    void manuallyLayoutChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child instanceof CustomImageView) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
            }
        }
    }
}
