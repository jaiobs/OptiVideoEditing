package com.litpic.litpicsdkdroid.camerapreview.model;

public class VideoSegmentData {
    private String audioUrl;
    private int startPosition;
    private int endPosition;
    private int duration;
    private String speedValue;

    public VideoSegmentData(String audioUrl, int startPosition, int endPosition) {
        this.audioUrl = audioUrl;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        duration = endPosition - startPosition;
    }

    public VideoSegmentData(String audioUrl, int startPosition, int endPosition, String speedValue) {
        this.audioUrl = audioUrl;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.speedValue = speedValue;
        duration = endPosition - startPosition;
    }

    public VideoSegmentData(int startPosition, int endPosition) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        duration = endPosition - startPosition;
    }

    public int getStartPosition() {
        return startPosition;
    }

    public int getEndPosition() {
        return endPosition;
    }

    public void setStartPosition(int startPosition) {
        this.startPosition = startPosition;
    }

    public void setEndPosition(int endPosition) {
        this.endPosition = endPosition;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration){
        this.duration = duration;
    }

    public String getAudioUrl() {
        if (audioUrl != null) {
            return audioUrl;
        } else {
            return "";
        }
    }

    public String getSpeedValue() {
        if (speedValue != null) {
            return speedValue;
        } else {
            return "";
        }
    }

    public void setSpeedValue(String speedValue) {
        this.speedValue = speedValue;
    }
}
