package com.litpic.litpicsdkdroid.imageview;

import android.content.Context;
import android.content.res.Configuration;
import android.net.Uri;
import android.util.AttributeSet;

import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatImageView;

public class TiltImageView extends AppCompatImageView {

    private int mImageWidth = 0;
    private int mImageHeight = 0;

    private int deviceHeight = 0;
    private int deviceWidth = 0;


    public TiltImageView(Context context) {
        super(context);
    }

    public TiltImageView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public TiltImageView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    public void setImageURI(@Nullable Uri uri) {
        super.setImageURI(uri);
        this.setScaleType(ScaleType.FIT_XY);
    }

    public void setImageHeightAndWidth(int width, int height) {
        this.mImageWidth = width;
        this.mImageHeight = height;
    }


    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = getDefaultSize(mImageWidth, widthMeasureSpec);
        int height = getDefaultSize(mImageHeight, heightMeasureSpec);
        if (mImageWidth > 0 && mImageHeight > 0 && mImageWidth > mImageHeight) {
            //if it is portrait need to assign height as device height else compute scale proportion
            if (getScreenOrientation() == Configuration.ORIENTATION_LANDSCAPE) {
                height = width * mImageHeight / mImageWidth;
                setFitsSystemWindows(true);
            } else {
                height = deviceHeight;
            }

        }
        setMeasuredDimension(width, height);
    }

    public void setDeviceHeight(int height) {
        deviceHeight = height;
    }

    private int getScreenOrientation() {
        return getResources().getConfiguration().orientation;
    }

    public void setDeviceWidth(int screenWidth) {
        deviceWidth = screenWidth;
    }

    public int getDeviceWidth() {
        return deviceWidth;
    }

}
