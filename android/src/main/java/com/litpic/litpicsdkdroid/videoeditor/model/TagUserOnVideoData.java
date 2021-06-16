package com.litpic.litpicsdkdroid.videoeditor.model;

public class TagUserOnVideoData {
    String fileUrl;
    float positionX;
    float positionY;
    boolean isGif;
    float width;
    float height;
    float rotation;


    public TagUserOnVideoData(String url, float x, float y, float width, float height, float rotation) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = false;
    }

    public TagUserOnVideoData(String url, float x, float y, float width, float height, float rotation, boolean isGif) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = isGif;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public float getPositionX() {
        return positionX;
    }

    public float getPositionY() {
        return positionY;
    }

    public boolean isGif() {
        return isGif;
    }

    public float getWidth() {
        return width;
    }

    public float getHeight() {
        return height;
    }

    public float getRotation() {
        return rotation;
    }
}
