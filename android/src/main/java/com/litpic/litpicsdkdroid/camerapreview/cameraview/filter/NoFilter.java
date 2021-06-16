package com.litpic.litpicsdkdroid.camerapreview.cameraview.filter;

import androidx.annotation.NonNull;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.BaseFilter;

/**
 * A {@link Filter} that draws frames without any modification.
 */
public final class NoFilter extends BaseFilter {

    @NonNull
    @Override
    public String getFragmentShader() {
        return createDefaultFragmentShader();
    }
}
