package com.litpic.litpicsdkdroid.camerapreview.cameraview.markers;

import android.content.Context;
import android.content.res.TypedArray;


import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Audio;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Facing;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Flash;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Grid;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Hdr;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Mode;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.Preview;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.VideoCodec;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.controls.WhiteBalance;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

/**
 * Parses markers from XML attributes.
 */
public class MarkerParser {

    private AutoFocusMarker autoFocusMarker = null;

    public MarkerParser(@NonNull TypedArray array) {
        String autoFocusName = array.getString(R.styleable.CameraView_cameraAutoFocusMarker);
        if (autoFocusName != null) {
            try {
                Class<?> autoFocusClass = Class.forName(autoFocusName);
                autoFocusMarker = (AutoFocusMarker) autoFocusClass.newInstance();
            } catch (Exception ignore) { }
        }
    }

    @Nullable
    public AutoFocusMarker getAutoFocusMarker() {
        return autoFocusMarker;
    }
}
