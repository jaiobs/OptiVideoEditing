package com.litpic.litpicsdkdroid.audiotrimming.player;

import android.media.MediaPlayer;
import android.media.MediaTimestamp;
import android.util.Log;

import androidx.annotation.Nullable;

import com.litpic.litpicsdkdroid.config.Constants;

import java.io.IOException;

public class AudioPlayer extends MediaPlayer {


    @Override
    public void stop(){
        super.stop();
        try {
            prepare();
        } catch (IOException e) {
            Log.d("@@@", Constants.EXCEPTION,e);
        }
    }

    @Nullable
    @Override
    public MediaTimestamp getTimestamp() {
        return super.getTimestamp();
    }
}
