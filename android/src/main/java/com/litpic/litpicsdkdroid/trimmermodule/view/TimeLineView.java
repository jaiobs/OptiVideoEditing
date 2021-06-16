
package com.litpic.litpicsdkdroid.trimmermodule.view;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.net.Uri;
import android.util.AttributeSet;
import android.util.LongSparseArray;
import android.view.View;

import androidx.annotation.NonNull;

import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.trimmermodule.utils.BackgroundExecutor;
import com.litpic.litpicsdkdroid.trimmermodule.utils.UiThreadExecutor;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

public class TimeLineView extends View {

    private int mHeightView;
    private LongSparseArray<Bitmap> mBitmapList = null;

    private int viewWidth = 0;
    private Uri videoPathUri;

    public TimeLineView(@NonNull Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public TimeLineView(@NonNull Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        mHeightView = getContext().getResources().getDimensionPixelOffset(R.dimen.frames_video_height_medium);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        final int minW = getPaddingLeft() + getPaddingRight() + getSuggestedMinimumWidth();
        int w = resolveSizeAndState(minW, widthMeasureSpec, 1);

        final int minH = getPaddingBottom() + getPaddingTop() + mHeightView;
        int h = resolveSizeAndState(minH, heightMeasureSpec, 1);

        setMeasuredDimension(w, h);
    }

    @Override
    protected void onSizeChanged(final int w, int h, final int oldW, int oldH) {
        super.onSizeChanged(w, h, oldW, oldH);
        if (w != oldW) {
            viewWidth = w;
            if (videoPathUri != null) {
                getBitmap(w);
            }
        }
    }

    public void getBitmap(final int viewWidth) {
        BackgroundExecutor.execute(new BackgroundExecutor.Task("", 0L, "") {
                                       @Override
                                       public void execute() {
                                           LongSparseArray<Bitmap> thumbnailList = new LongSparseArray<>();
                                           long videoLengthInMs = MediaUtils.getVideoDurationInMillis(getContext(), videoPathUri);
                                           // Set thumbnail properties (Thumbs are squares)
                                           final int thumbWidth = mHeightView;
                                           final int thumbHeight = mHeightView;
                                           int numThumbs = (int) Math.ceil(((float) viewWidth) / thumbWidth);
                                           final long interval = videoLengthInMs / numThumbs;
                                           for (int i = 0; i < numThumbs; ++i) {
                                               Bitmap bitmap = MediaUtils.getFrameAt(i * interval, getContext(), videoPathUri);
                                               bitmap = Bitmap.createScaledBitmap(bitmap, thumbWidth, thumbHeight, false);
                                               thumbnailList.put(i, bitmap);
                                           }
                                           returnBitmaps(thumbnailList);
                                       }
                                   }
        );
    }

    private void returnBitmaps(final LongSparseArray<Bitmap> thumbnailList) {
        UiThreadExecutor.runTask("", new Runnable() {
                    @Override
                    public void run() {
                        mBitmapList = thumbnailList;
                        invalidate();
                    }
                }
                , 0L);
    }

    @Override
    protected void onDraw(@NonNull Canvas canvas) {
        super.onDraw(canvas);

        if (mBitmapList != null) {
            canvas.save();
            int x = 0;

            for (int i = 0; i < mBitmapList.size(); i++) {
                Bitmap bitmap = mBitmapList.get(i);

                if (bitmap != null) {
                    canvas.drawBitmap(bitmap, x, 0, null);
                    x = x + bitmap.getWidth();
                }
            }
        }
    }

    public void setVideo(@NonNull Uri data) {
        videoPathUri = data;
    }

    public void resetThumbList() {
        getBitmap(viewWidth);
        requestLayout();
    }
}
