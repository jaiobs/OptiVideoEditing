package com.litpic.litpicsdkdroid.filtertovideo;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import com.daasuu.gpuv.composer.FillMode;
import com.daasuu.gpuv.composer.GPUMp4Composer;
import com.daasuu.gpuv.egl.filter.GlBrightnessFilter;
import com.daasuu.gpuv.egl.filter.GlContrastFilter;
import com.daasuu.gpuv.egl.filter.GlFilter;
import com.daasuu.gpuv.egl.filter.GlFilterGroup;
import com.daasuu.gpuv.egl.filter.GlGrayScaleFilter;
import com.daasuu.gpuv.egl.filter.GlMonochromeFilter;
import com.daasuu.gpuv.egl.filter.GlSepiaFilter;
import com.daasuu.gpuv.egl.filter.GlToneFilter;
import com.daasuu.gpuv.egl.filter.GlZoomBlurFilter;
import com.facebook.react.bridge.ReadableMap;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.trimmermodule.TrimmerVideoData;
import com.litpic.litpicsdkdroid.trimming_video.FilterMultiFileUpdate;
import com.litpic.litpicsdkdroid.trimming_video.FilterProcessUpdate;
import com.litpic.litpicsdkdroid.utils.FileUtils;

import java.io.File;
import java.util.List;
import java.util.Objects;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;
import static com.litpic.litpicsdkdroid.config.Constants.BRIGHTNESS;
import static com.litpic.litpicsdkdroid.config.Constants.CONTRAST;
import static com.litpic.litpicsdkdroid.config.Constants.SATURATION;
import static com.litpic.litpicsdkdroid.config.Constants.TYPE;

public class FilterUtility {
    private static final String TAG = "JK";
    private final Context context;

    public FilterUtility(Context context) {
        this.context = context;
    }

    public static GlFilter getFilter(ReadableMap filter){
        if (filter == null) {
            return null;
        }

        float contrast = 0.0f;
        float brightness = 0.0f;

        String filterType = Objects.requireNonNull(filter).getString(TYPE);

        if (filter.hasKey(CONTRAST) && filter.hasKey(BRIGHTNESS) && filter.hasKey(
                SATURATION)) {
            contrast = (float) filter.getDouble(CONTRAST);
            brightness = (float) filter.getDouble(BRIGHTNESS);
        }

        switch (Objects.requireNonNull(filterType)) {
            case Constants.CSB:

                GlBrightnessFilter brightnessFilter = new GlBrightnessFilter();
                brightnessFilter.setBrightness(brightness);

                GlContrastFilter contrastFilter = new GlContrastFilter();
                contrastFilter.setContrast(contrast);

                return new GlFilterGroup(brightnessFilter,contrastFilter);

            case Constants.GREY_SCALE:
                return new GlGrayScaleFilter();

            case Constants.SEPIA:
                return new GlSepiaFilter();

            case Constants.MONOCHROME:
                return new GlMonochromeFilter();

            case Constants.BLUR:
                return new GlZoomBlurFilter();

            case Constants.BEAUTY:
                return new GlToneFilter();

            default:
                return null;

        }
    }

    int filterPosition;
    boolean isFilterProcessing = false;
    public void multipleVideoFilterApply(final List<TrimmerVideoData> trimmerVideoDataList,
                                          final FilterMultiFileUpdate filterMultiFileUpdate) {
        if (trimmerVideoDataList.size() == filterPosition) {
            filterPosition =0;
            isFilterProcessing = false;
            filterMultiFileUpdate.onFilterCompleted();
            return;
        }
        TrimmerVideoData trimmerVideoData = trimmerVideoDataList.get(filterPosition);
        if (trimmerVideoData.getFilterValues() != null
                && trimmerVideoData.getFilterValues().hasKey(Constants.TYPE)
                && !trimmerVideoData.getFilterValues().getString(Constants.TYPE).equals(Constants.NORMAL)) {
            applyVideoFilter(new FilterProcessUpdate() {
                @Override
                public void onFilterCompleted(boolean isCompleted) {
                    filterPosition++;
                    multipleVideoFilterApply(trimmerVideoDataList, filterMultiFileUpdate);
                }
            }, trimmerVideoData);
        }else{
            filterPosition++;
            multipleVideoFilterApply(trimmerVideoDataList, filterMultiFileUpdate);
        }
    }

    public void applyVideoFilter(final FilterProcessUpdate filterProcessUpdate,
                                  final TrimmerVideoData trimmerVideoData) {
        Log.e("JK","applyVideoFilter "+trimmerVideoData.getVideoUrl());

        final File tempFile = new File(FileUtils.getVideoCacheDir(context), "filtered_"+new File(trimmerVideoData.getVideoUrl()).getName());
        new GPUMp4Composer(trimmerVideoData.getVideoFile().getAbsolutePath(), tempFile.getAbsolutePath())
                .fillMode(FillMode.PRESERVE_ASPECT_FIT)
                .filter(FilterUtility.getFilter(trimmerVideoData.getFilterValues()))
                .listener(new GPUMp4Composer.Listener() {
                    @Override
                    public void onProgress(double progress) {
                        Log.d(TAG, "onProgress = " + progress);
                    }

                    @Override
                    public void onCompleted() {
                        Log.d(TAG, "onCompleted()");
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                trimmerVideoData.setVideoUrl(Uri.fromFile(tempFile).getEncodedPath());
                                filterProcessUpdate.onFilterCompleted(true);
                            }
                        });
                    }

                    @Override
                    public void onCanceled() {
                        Log.d(TAG, "onCanceled");
                        filterProcessUpdate.onFilterCompleted(false);
                    }

                    @Override
                    public void onFailed(Exception exception) {
                        Log.e(TAG, "onFailed()", exception);
                        filterProcessUpdate.onFilterCompleted(false);
                    }
                }).start();
    }
}
