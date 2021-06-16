package com.litpic.litpicsdkdroid.utils;

import android.util.Log;

import androidx.annotation.NonNull;

public class Logger {

    private Logger() {
    }

    public static void message(@NonNull String content, boolean important) {
        if (important) {
            Log.e("@@@ - WARNING", content);
        } else {
            Log.i("info", content);
        }
    }
}
