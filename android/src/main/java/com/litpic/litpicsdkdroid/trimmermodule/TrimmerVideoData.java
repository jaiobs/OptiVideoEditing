package com.litpic.litpicsdkdroid.trimmermodule;

import android.content.Context;
import android.net.Uri;

import com.facebook.react.bridge.ReadableMap;
import com.litpic.litpicsdkdroid.trimming_video.FileUtils;

import java.io.File;

public class TrimmerVideoData {

    private String videoUrl;
    private int videoWidth;
    private int videoHeight;
    private int duration;
    private int totalSelectedTime;
    private int startPosition;
    private int endPosition;
    private boolean hasAudioStream;
    private ReadableMap filterValues;

    public TrimmerVideoData(String url) {
        this.videoUrl = url;
        this.startPosition = -1;
        this.endPosition = -1;
        this.totalSelectedTime = 0;
    }

    public void setStartPosition(int startPosition) {
        this.startPosition = startPosition;
    }

    public int getStartPosition() {
        return startPosition;
    }

    public void setEndPosition(int endPosition) {
        this.endPosition = endPosition;
    }

    public int getEndPosition() {
        return endPosition;
    }

    public void setTotalSelectedTime(int selectedTime) {
        this.totalSelectedTime = selectedTime;
    }

    public int getTotalSelectedTime() {
        return totalSelectedTime;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getDuration() {
        return duration;
    }

    public boolean isHasAudioStream() {
        return hasAudioStream;
    }

    public void setHasAudioStream(boolean hasAudioStream) {
        this.hasAudioStream = hasAudioStream;
    }

    public void setVideoUrl(String url) {
        this.videoUrl = url;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public File getVideoFile(Context context) {
        return new File(FileUtils.getPath(context, Uri.parse(videoUrl)));
    }

    public File getVideoFile() {
        return new File(videoUrl);
    }

    public int getVideoWidth() {
        return videoWidth;
    }

    public int getVideoHeight() {
        return videoHeight;
    }

    public void setVideoWidth(int width) {
        this.videoWidth = width;
    }

    public void setVideoHeight(int height) {
        this.videoHeight = height;
    }

    public void setFilterValues(ReadableMap readableMap) {
        this.filterValues = readableMap;
    }

    public ReadableMap getFilterValues() {
        return filterValues;
    }
}