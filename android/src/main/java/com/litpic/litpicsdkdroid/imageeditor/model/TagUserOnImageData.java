package com.litpic.litpicsdkdroid.imageeditor.model;

import com.facebook.react.bridge.WritableMap;

public class TagUserOnImageData {

    private String fileUrl;
    private float positionX;
    private float positionY;
    private boolean isGif;
    private float width;
    private float height;
    private float rotation;

    private WritableMap tagUserData;

    public TagUserOnImageData(String url, float x, float y, float width, float height, float rotation, boolean isGif) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = isGif;
    }


    public void setTagUserData(WritableMap tagUserData) {
        this.tagUserData = tagUserData;
    }

    public WritableMap getTagUserData() {
        return tagUserData;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public float getPositionX() {
        return positionX;
    }

    public void setPositionX(float positionX) {
        this.positionX = positionX;
    }

    public float getPositionY() {
        return positionY;
    }

    public void setPositionY(float positionY) {
        this.positionY = positionY;
    }

    public boolean isGif() {
        return isGif;
    }

    public void setIsGif(boolean isGif) {
        this.isGif = isGif;
    }

    public float getWidth() {
        return width;
    }

    public void setWidth(float width) {
        this.width = width;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public float getRotation() {
        return rotation;
    }

    public void setRotation(float rotation) {
        this.rotation = rotation;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

}
