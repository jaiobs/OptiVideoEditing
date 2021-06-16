package com.litpic.litpicsdkdroid.audiotrimming.customviews;

import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.os.Handler;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.AudioRangeSeekBarListener;
import com.litpic.litpicsdkdroid.trimmermodule.view.Thumb;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.LogRecord;

public class AudioRangeSeekBar extends View {

    private int mHeightTimeLine;
    private List<Thumb> mThumbs;
    private List<AudioRangeSeekBarListener> mListeners;
    private float mMaxWidth;
    private float mThumbWidth;
    private float mThumbHeight;
    private int mViewWidth;
    private float mPixelRangeMin;
    private float mPixelRangeMax;
    private float mScaleRangeMax;
    private boolean mFirstRun;
    private boolean showSecondThumb = false;

    private final Paint mShadow = new Paint();
    private final Paint mLine = new Paint();

    public AudioRangeSeekBar(@NonNull Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public AudioRangeSeekBar(@NonNull Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        mThumbs = Thumb.initThumbs(getResources());
        mThumbWidth = Thumb.getWidthBitmap(mThumbs);
        mThumbHeight = Thumb.getHeightBitmap(mThumbs);

        mScaleRangeMax = 100;
        mHeightTimeLine = getContext().getResources().getDimensionPixelOffset(
                R.dimen.frames_video_height);

        setFocusable(true);
        setFocusableInTouchMode(true);

        mFirstRun = true;

        int shadowColor = ContextCompat.getColor(getContext(), R.color.shadow_color);
        mShadow.setAntiAlias(true);
        mShadow.setColor(shadowColor);
        mShadow.setAlpha(100);

        int lineColor = ContextCompat.getColor(getContext(), R.color.line_color);
        mLine.setAntiAlias(true);
        mLine.setColor(lineColor);
        mLine.setAlpha(200);

    }

    public void initMaxWidth() {
        mMaxWidth = mThumbs.get(1).getPos() - mThumbs.get(0).getPos();

        onSeekStop(this, 0, mThumbs.get(0).getVal());
        onSeekStop(this, 1, mThumbs.get(1).getVal());
    }

    public void setMaxWidth(int maxWidth) {
        mMaxWidth = mThumbs.get(1).getPos() - mThumbs.get(0).getPos() + maxWidth;

        onSeekStop(this, 0, mThumbs.get(0).getVal());
        onSeekStop(this, 1, mThumbs.get(1).getVal());
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        int minW = getPaddingLeft() + getPaddingRight() + getSuggestedMinimumWidth();
        mViewWidth = resolveSizeAndState(minW, widthMeasureSpec, 1);

        int minH = getPaddingBottom() + getPaddingTop() + (int) mThumbHeight + mHeightTimeLine;
        int viewHeight = resolveSizeAndState(minH, heightMeasureSpec, 1);

        setMeasuredDimension(mViewWidth, viewHeight);

        if (this.getResources().getConfiguration().orientation ==
                Configuration.ORIENTATION_LANDSCAPE) {
            mPixelRangeMax = mViewWidth - mThumbWidth;
            mThumbs.get(1).setPos(mPixelRangeMax);
            mThumbs.get(1).setVal(mScaleRangeMax);
        } else {
            mPixelRangeMin = 0;
            mPixelRangeMax = mViewWidth - mThumbWidth;
        }

        if (mFirstRun) {
            for (int i = 0; i < mThumbs.size(); i++) {
                Thumb th = mThumbs.get(i);
                th.setVal(mScaleRangeMax * i);
                th.setPos(mPixelRangeMax * i);
            }
            // Fire listener callback
            onCreate(this, currentThumb, getThumbValue(currentThumb));
            mFirstRun = false;
        }
    }

    @Override
    protected void onDraw(@NonNull Canvas canvas) {
        super.onDraw(canvas);

        drawShadow(canvas);
        drawThumbs(canvas);
    }

    private int currentThumb = 0;
    private boolean isLongPress = false;

    private Handler pressHandler = new Handler();
    private Runnable onLongPress =new Runnable() {
        @Override
        public void run() {
            isLongPress = true;
        }
        //do whatever you want on long press
    };

    @Override
    public boolean onTouchEvent(@NonNull MotionEvent ev) {
        final Thumb mThumb;
        final Thumb mThumb2;
        final float coordinate = ev.getX();
        final int action = ev.getAction();

        switch (action) {
            case MotionEvent.ACTION_DOWN: {
                // Remember where we started
                currentThumb = getClosestThumb(coordinate);
                pressHandler.postDelayed(onLongPress, 500);

                if (currentThumb == -1) {
                    return false;
                }
                mThumb = mThumbs.get(currentThumb);
                mThumb.setLastTouchX(coordinate);
                onSeekStart(this, currentThumb, mThumb.getVal());
                return true;
            }
            case MotionEvent.ACTION_UP: {
                if (currentThumb == -1) {
                    return false;
                }
                if (!isLongPress) {
                    pressHandler.removeCallbacks(onLongPress);
                    mThumb = mThumbs.get(currentThumb);
                    onSeekStop(this, currentThumb, mThumb.getVal());
                    isLongPress = false;
                }
                isLongPress = false;
                return true;

            }

            case MotionEvent.ACTION_MOVE: {
                mThumb = mThumbs.get(currentThumb);
                mThumb2 = mThumbs.get(currentThumb == 0 ? 1 : 0);
                // Calculate the distance moved
                final float dx = coordinate - mThumb.getLastTouchX();
                final float newX = mThumb.getPos() + dx;
                if (currentThumb == 0) {

                    if ((newX + mThumb.getWidthBitmap()) >= mThumb2.getPos()) {
                        mThumb.setPos(mThumb2.getPos() - mThumb.getWidthBitmap());
                    } else if (newX <= mPixelRangeMin) {
                        mThumb.setPos(mPixelRangeMin);
                    } else {
                        //Check if thumb is not out of max width
                        checkPositionThumb(mThumb, mThumb2, dx, true);
                        // Move the object
                        mThumb.setPos(mThumb.getPos() + dx);

                        // Remember this touch position for the next move event
                        mThumb.setLastTouchX(coordinate);
                    }

                } else {
                    if (newX <= mThumb2.getPos() + mThumb2.getWidthBitmap()) {
                        mThumb.setPos(mThumb2.getPos() + mThumb.getWidthBitmap());
                    } else if (newX >= mPixelRangeMax) {
                        mThumb.setPos(mPixelRangeMax);
                    } else {
                        //Check if thumb is not out of max width
                        checkPositionThumb(mThumb2, mThumb, dx, false);
                        // Move the object
                        mThumb.setPos(mThumb.getPos() + dx);
                        // Remember this touch position for the next move event
                        mThumb.setLastTouchX(coordinate);
                    }
                }

                setThumbPos(currentThumb, mThumb.getPos());

                // Invalidate to request a redraw
                invalidate();
                return true;
            }
            default:
                break;
        }
        return false;
    }

    private void checkPositionThumb(@NonNull Thumb mThumbLeft, @NonNull Thumb mThumbRight, float dx,
                                    boolean isLeftMove) {
        if (isLeftMove && dx < 0) {
            if ((mThumbRight.getPos() - (mThumbLeft.getPos() + dx)) > mMaxWidth) {
                mThumbRight.setPos(mThumbLeft.getPos() + dx + mMaxWidth);
                setThumbPos(1, mThumbRight.getPos());
            }
        } else if (!isLeftMove && dx > 0 && (((mThumbRight.getPos() + dx) - mThumbLeft.getPos()) > mMaxWidth)) {
            mThumbLeft.setPos(mThumbRight.getPos() + dx - mMaxWidth);
            setThumbPos(0, mThumbLeft.getPos());

        }
    }

    private float pixelToScale(int index, float pixelValue) {
        float scale = (pixelValue * 100) / mPixelRangeMax;
        if (index == 0) {
            float pxThumb = (scale * mThumbWidth) / 100;
            return scale + (pxThumb * 100) / mPixelRangeMax;
        } else {
            float pxThumb = ((100 - scale) * mThumbWidth) / 100;
            return scale - (pxThumb * 100) / mPixelRangeMax;
        }
    }

    public float scaleToPixel(int index, float scaleValue) {
        float px = (scaleValue * mPixelRangeMax) / 100;
        if (index == 0) {
            float pxThumb = (scaleValue * mThumbWidth) / 100;
            return px - pxThumb;
        } else {
            float pxThumb = ((100 - scaleValue) * mThumbWidth) / 100;
            return px + pxThumb;
        }
    }

    private void calculateThumbValue(int index) {
        if (index < mThumbs.size() && !mThumbs.isEmpty()) {
            Thumb th = mThumbs.get(index);
            th.setVal(pixelToScale(index, th.getPos()));
            onSeek(this, index, th.getVal(), th.getPos());
        }
    }

    private void calculateThumbPos(int index) {
        if (index < mThumbs.size() && !mThumbs.isEmpty()) {
            Thumb th = mThumbs.get(index);
            th.setPos(scaleToPixel(index, th.getVal()));
        }
    }

    private float getThumbValue(int index) {
        return mThumbs.get(index).getVal();
    }

    public void setThumbValue(int index, float value) {
        mThumbs.get(index).setVal(value);
        calculateThumbPos(index);
        // Tell the view we want a complete redraw
        invalidate();
    }

    public void setThumbPos(int index, float pos) {
        mThumbs.get(index).setPos(pos);
        calculateThumbValue(index);
        // Tell the view we want a complete redraw
        invalidate();
    }

    private int getClosestThumb(float coordinate) {
        int closest = -1;
        if (!mThumbs.isEmpty()) {
            for (int i = 0; i < mThumbs.size(); i++) {
                // Find thumb closest to x coordinate
                final float toCoOrdinate = mThumbs.get(i).getPos() + mThumbWidth;
                if (coordinate >= mThumbs.get(i).getPos() && coordinate <= toCoOrdinate) {
                    closest = mThumbs.get(i).getIndex();
                }
            }
        }
        return closest;
    }

    private void drawShadow(@NonNull Canvas canvas) {
        if (!mThumbs.isEmpty()) {

            for (Thumb th : mThumbs) {
                if (th.getIndex() == 0) {
                    final float x = th.getPos() + getPaddingLeft();
                    if (x > mPixelRangeMin) {
                        Rect mRect = new Rect((int) mThumbWidth, 0, (int) (x + mThumbWidth),
                                mHeightTimeLine);
                        canvas.drawRect(mRect, mShadow);
                    }
                } else {
                    final float x = th.getPos() - getPaddingRight();
                    if (x < mPixelRangeMax && showSecondThumb) {
                        Rect mRect = new Rect((int) x, 0, (int) (mViewWidth - mThumbWidth),
                                mHeightTimeLine);
                        canvas.drawRect(mRect, mShadow);
                    }
                }
            }
        }
    }

    private void drawThumbs(@NonNull Canvas canvas) {

        if (!mThumbs.isEmpty()) {
            for (Thumb th : mThumbs) {
                if (th.getIndex() == 0) {
                    canvas.drawBitmap(Bitmap.createScaledBitmap(th.getBitmap(), th.getBitmap().getWidth(), getMeasuredHeight(), false), th.getPos() + getPaddingLeft(),
                            getPaddingTop(), null);
                } else if (showSecondThumb) {
                    canvas.drawBitmap(Bitmap.createScaledBitmap(th.getBitmap(), th.getBitmap().getWidth(), getMeasuredHeight(), false), th.getPos() - getPaddingRight(),
                            getPaddingTop(), null);

                }
            }
        }
    }

    public void addOnRangeSeekBarListener(AudioRangeSeekBarListener listener) {

        if (mListeners == null) {
            mListeners = new ArrayList<>();
        }

        mListeners.add(listener);
    }

    private void onCreate(AudioRangeSeekBar rangeSeekBarView, int index, float value) {
        if (mListeners == null) {
            return;
        }

        for (AudioRangeSeekBarListener item : mListeners) {
            item.onCreate(rangeSeekBarView, index, value);
        }
    }

    private void onSeek(AudioRangeSeekBar rangeSeekBarView, int index, float value,
                        float position) {
        if (mListeners == null) {
            return;
        }

        for (AudioRangeSeekBarListener item : mListeners) {
            item.onSeek(rangeSeekBarView, index, value, position);
        }
    }

    private void onSeekStart(AudioRangeSeekBar rangeSeekBarView, int index, float value) {
        showSecondThumb = true;
        if (mListeners == null) {
            return;
        }

        for (AudioRangeSeekBarListener item : mListeners) {
            item.onSeekStart(rangeSeekBarView, index, value);
        }
    }

    private void onSeekStop(AudioRangeSeekBar rangeSeekBarView, int index, float value) {
        if (mListeners == null) {
            return;
        }

        for (AudioRangeSeekBarListener item : mListeners) {
            item.onSeekStop(rangeSeekBarView, index, value);
        }
    }

    public List<Thumb> getThumbs() {
        return mThumbs;
    }
}
