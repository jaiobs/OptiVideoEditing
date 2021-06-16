package com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.core.content.ContextCompat;

import com.litpic.litpicsdkdroid.R;

public class CropperView extends View {

    private int mCropperWidth = 1;
    private int mCropperHeight = 1;

    int maxWidth = 0;

    float margin = 0f;

    private float dX;
    private int videoWidth;

    private VideoCropperInterface videoCropperInterface;

    public void setCropperListener(VideoCropperInterface cropperInterface) {
        this.videoCropperInterface = cropperInterface;
    }

    public interface VideoCropperInterface {
        void onVideoCropPositionChanged(int position);
    }

    public CropperView(Context context, int width, int height) {
        super(context);
        init(width, height, context);
    }

    public CropperView(Context context) {
        super(context);
    }

    public CropperView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public CropperView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    private void init(int width, int height, Context context) {
        setLayoutParams(new ViewGroup.LayoutParams(width, height));
        setBackground(ContextCompat.getDrawable(context, R.drawable.dotted_border));
        requestLayout();
    }

    public void setSize(int width, int height) {
        mCropperWidth = width;
        mCropperHeight = height;
        this.requestLayout();
    }

    public void setTopRegion(int x, int y) {
        this.animate()
                .x(x)
                .y(y)
                .setDuration(0)
                .start();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = getDefaultSize(mCropperWidth, widthMeasureSpec);
        int height = getDefaultSize(mCropperHeight, heightMeasureSpec);
        setMeasuredDimension(width, height);
    }


    @Override
    public boolean onTouchEvent(MotionEvent event) {

        margin = isExceedBoundary(event.getRawX() + dX) ? margin : event.getRawX() + dX;

        // prevent divide by zero exception
        if (maxWidth == 0){
            maxWidth = 1;
        }

        float videoPosition = ((videoWidth * 1.0f) / maxWidth) * margin;

        videoCropperInterface.onVideoCropPositionChanged((int) videoPosition);


        switch (event.getAction()) {

            case MotionEvent.ACTION_DOWN:
                dX = isExceedBoundary(margin) ? dX : getX() - event.getRawX();
                break;

            case MotionEvent.ACTION_MOVE:
                animate()
                        .x(margin)
                        .setDuration(0)
                        .start();
                break;

            default:
                return false;
        }
        return true;
    }

    private boolean isExceedBoundary(float margin) {
        return margin <= 0 || ((margin + getWidth()) - maxWidth) >= 0;
    }

    public void setMaxWidth(int width) {
        maxWidth = width;
    }

    public void setVideoWidth(int videoWidth) {
        this.videoWidth = videoWidth;
    }
}
