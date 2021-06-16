package com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.meter;

import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.action.ActionHolder;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.action.ActionWrapper;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.action.Actions;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.action.BaseAction;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.lock.ExposureLock;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.lock.FocusLock;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.engine.lock.WhiteBalanceLock;

@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
public class MeterResetAction extends ActionWrapper {

    private final BaseAction action;

    public MeterResetAction() {
        this.action = Actions.together(
                new ExposureReset(),
                new FocusReset(),
                new WhiteBalanceReset()
        );
    }

    @NonNull
    @Override
    public BaseAction getAction() {
        return action;
    }
}
