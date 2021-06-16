package com.litpic.litpicsdkdroid.imageeditor.customview;

import android.content.Context;
import android.content.res.Configuration;
import android.util.AttributeSet;

import com.litpic.litpicsdkdroid.trimmermodule.view.VideoViewPreview;

public class CustomImageView extends androidx.appcompat.widget.AppCompatImageView {

    private VideoViewPreview.SizeListener sizeListener;
    private int mImageWidth = 0;
    private int mImageHeight = 0;
    private boolean isLandscape = false;
    private int screenWidth;
    private int screenHeight;

    public CustomImageView(Context context) {
        super(context);
    }

    public CustomImageView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public CustomImageView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public void setSizeListener(VideoViewPreview.SizeListener listener) {
        this.sizeListener = listener;
        this.setScaleType(ScaleType.FIT_XY);
    }

    public boolean isLandscape() {
        return isLandscape;
    }

    public void setImageHeightAndWidth(int width, int height) {
        this.mImageWidth = width;
        this.mImageHeight = height;
        isLandscape = mImageWidth > mImageHeight;
        screenWidth = getResources().getDisplayMetrics().widthPixels;
        screenHeight = getResources().getDisplayMetrics().heightPixels;
        requestLayout();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = getDefaultSize(mImageWidth, widthMeasureSpec);
        int height = getDefaultSize(mImageHeight, heightMeasureSpec);
        if (mImageWidth > 0 && mImageHeight > 0) {
            if (mImageWidth == mImageHeight) {
                if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT) {
                    width = screenWidth;
                    height = screenWidth;
                } else {
                    width = screenHeight;
                    height = screenHeight;
                }
            } else if (mImageWidth > mImageHeight) {
                height = width * mImageHeight / mImageWidth;
            } else {
                width = height * mImageWidth / mImageHeight;
            }
        }
        if (sizeListener != null) {
            sizeListener.onSizeChanged(width, height);
        }
        setMeasuredDimension(width, height);
    }

    public float getImageX() {
        int[] pos = new int[2];
        getLocationOnScreen(pos);
        return pos[0];

    }

    public float getImageY() {
        int[] pos = new int[2];
        getLocationOnScreen(pos);
        return pos[1];
    }
}
