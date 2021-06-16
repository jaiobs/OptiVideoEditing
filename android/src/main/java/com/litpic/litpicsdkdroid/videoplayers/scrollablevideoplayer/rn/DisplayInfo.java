package com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.rn;


import android.content.Context;
import android.util.DisplayMetrics;
import android.view.WindowManager;

public class DisplayInfo {
    int screenHeight = 0;
    int screenWidth = 0;
    WindowManager wm;
    DisplayMetrics displaymetrics;

    public DisplayInfo(Context context) {
        getDisplayHeightWidth(context);
    }

    void getDisplayHeightWidth(Context context) {
        wm = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        displaymetrics = new DisplayMetrics();
        wm.getDefaultDisplay().getMetrics(displaymetrics);
        screenHeight = displaymetrics.heightPixels;
        screenWidth = displaymetrics.widthPixels;
    }

    public int getScreenHeight() {
        return screenHeight;
    }

    public int getScreenWidth() {
        return screenWidth;
    }
}
