package com.litpic.litpicsdkdroid.camerapreview.cameraview.markers;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraView;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.gesture.GestureAction;

/**
 * Gives information about what triggered the autofocus operation.
 */
public enum AutoFocusTrigger {

    /**
     * Autofocus was triggered by {@link GestureAction#AUTO_FOCUS}.
     */
    GESTURE,

    /**
     * Autofocus was triggered by the {@link CameraView#startAutoFocus(float, float)} method.
     */
    METHOD
}
