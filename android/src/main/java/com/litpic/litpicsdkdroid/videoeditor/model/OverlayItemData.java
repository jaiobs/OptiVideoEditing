package com.litpic.litpicsdkdroid.videoeditor.model;

public class OverlayItemData {
    String fileUrl;
    float positionX;
    float positionY;
    boolean isGif;
    float width;
    float height;
    float rotation;
    float rotationX;
    float rotationY;


    public OverlayItemData(String url, float x, float y, float width, float height, float rotation) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = false;
    }

    public OverlayItemData(String url, float x, float y, float width, float height, float rotation,float rotationX,float rotationY) {   // NOSONAR
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.rotationX = rotationX;
        this.rotationY = rotationY;
        this.isGif = false;
    }

    public OverlayItemData(String url, float x, float y, float width, float height, float rotation, boolean isGif) {
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

    public float getRotationX() {
        return rotationX;
    }

    public float getRotationY() {
        return rotationY;
    }
}
