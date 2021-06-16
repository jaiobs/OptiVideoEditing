package com.litpic.litpicsdkdroid.audiotrimming.interfaces;

import com.litpic.litpicsdkdroid.audiotrimming.customviews.AudioRangeSeekBar;

public interface AudioRangeSeekBarListener {

    void onCreate(AudioRangeSeekBar audioRangeSeekBar, int index, float value);

    void onSeek(AudioRangeSeekBar audioRangeSeekBar, int index, float value,float position);

    void onSeekStart(AudioRangeSeekBar audioRangeSeekBar, int index, float value);

    void onSeekStop(AudioRangeSeekBar audioRangeSeekBar, int index, float value);
}
