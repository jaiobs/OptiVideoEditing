package com.litpic.litpicsdkdroid.imageeditor.model;

public class OverlayOnImageData {
    private String fileUrl;
    private float positionX;
    private float positionY;
    private boolean isGif;
    private float width;
    private float height;
    private float rotation;
    private int playingTime;
    private float rotationX;
    private float rotationY;


    public OverlayOnImageData(String url, float x, float y, float width, float height, float rotation) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = false;
    }

    public OverlayOnImageData(String url, float x, float y, float width, float height, float rotation, float rotationX, float rotationY) { // NOSONAR
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

    public OverlayOnImageData(String url, float x, float y, float width, float height, float rotation, boolean isGif) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = isGif;
    }

    public OverlayOnImageData(String url, float x, float y, float width, float height, float rotation, int playingTime) {
        this.fileUrl = url;
        this.positionX = x;
        this.positionY = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.isGif = true;
        this.playingTime = playingTime;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl){
        this.fileUrl = fileUrl;
    }

    public float getPositionX() {
        return positionX;
    }

    public void setPositionX(float positionX){
        this.positionX = positionX;
    }

    public float getPositionY() {
        return positionY;
    }

    public void setPositionY(float positionY){
        this.positionY = positionY;
    }

    public boolean isGif() {
        return isGif;
    }

    public void setIsGif(boolean isGif){
        this.isGif = isGif;
    }

    public float getWidth() {
        return width;
    }

    public void setWidth(float width){
        this.width =  width;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height){
        this.height = height;
    }

    public float getRotation() {
        return rotation;
    }

    public void setRotation(float rotation){
        this.rotation = rotation;
    }

    public int getPlayingTime() {
        return playingTime;
    }

    public void setPlayingTime(int playingTime){
        this.playingTime = playingTime;
    }

    public float getRotationX() {
        return rotationX;
    }

    public void setRotationX(float rotationX){
        this.rotationX = rotationX;
    }

    public float getRotationY() {
        return rotationY;
    }

}
