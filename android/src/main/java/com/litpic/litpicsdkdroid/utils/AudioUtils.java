package com.litpic.litpicsdkdroid.utils;

import android.content.Context;

import java.io.File;

public class AudioUtils {

    private AudioUtils() {
    }

    public static String getSoundIfCached(Context context, String trackPath) {
        String cachePath = FileUtils.getDownloadedMusicCachePath(context, getSoundId(trackPath));
        if (cachePath != null) {
            File cacheFile = new File(cachePath);
            if (cacheFile.exists() && cacheFile.length() > 0) {
                return cacheFile.getAbsolutePath();
            }
        }
        return null;
    }

    public static String getSoundId(String trackPath) {
        String[] trackSp = trackPath.split("/");
        return trackSp[trackSp.length - 2];
    }
}
