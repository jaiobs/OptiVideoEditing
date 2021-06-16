package com.litpic.litpicsdkdroid.imageeditor.textoverlay;

import android.content.Context;
import android.graphics.Rect;
import android.os.Handler;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.GestureDetector;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.view.animation.LinearInterpolator;
import android.view.inputmethod.InputMethodManager;

import androidx.appcompat.widget.AppCompatImageView;

public class TextOverlayOnImage extends androidx.appcompat.widget.AppCompatEditText
        implements ScaleGestureDetector.OnScaleGestureListener, View.OnTouchListener {

    float dX;
    float dY;

    float angle = 0;

    private float mScaleFactor = 1.0f;
    private float d = 0f;
    private AppCompatImageView trashView;
    OverLayListener removeOverlayViewListener;
    int screenWidth;
    int screenHeight;

    private static final int NONE = 0;
    private static final int DRAG = 1;
    private static final int ZOOM = 2;
    private int mode = NONE;
    float oldDist = 1f;
    float scaleDiff;
    float scalingLimit = 5.0f;
    int parentViewWidth;
    int parentViewHeight;
    float parentX;
    float parentY;
    float scaleValueX = 0f;
    float scaleValueY = 0f;

    public TextOverlayOnImage(Context context) {
        super(context);
    }

    public TextOverlayOnImage(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView(context);
    }

    private void initView(Context context) {
        new ScaleGestureDetector(context, this);
        //init scale listener
        setOnTouchListener(this);
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        screenWidth = displayMetrics.widthPixels;
        screenHeight = displayMetrics.heightPixels;
        setCursorVisible(true);
    }

    private final GestureDetector gestureDetector = new GestureDetector(getContext(),
            new GestureDetector.SimpleOnGestureListener() {
                @Override
                public boolean onDoubleTap(MotionEvent e) {
                    onTapPressed();
                    return super.onDoubleTap(e);
                }
            });

    private void onTapPressed() {                       // NOSONAR
        removeOverlayViewListener.updateActiveText(this);
        this.requestFocus();
        InputMethodManager imm = (InputMethodManager) getContext().getSystemService(
                Context.INPUT_METHOD_SERVICE);
        imm.showSoftInput(this, InputMethodManager.SHOW_FORCED);
    }

    public void removeFocus() {
        setCursorVisible(false);
    }

    public TextOverlayOnImage(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public void setTrashView(AppCompatImageView view) {
        this.trashView = view;
    }

    public void setRemoveOverlayViewListener(OverLayListener removeOverlayViewListener) {
        this.removeOverlayViewListener = removeOverlayViewListener;
    }

    @Override
    public boolean onScale(ScaleGestureDetector scaleGestureDetector) {
        mScaleFactor *= scaleGestureDetector.getScaleFactor();
        mScaleFactor = Math.max(0.1f, Math.min(mScaleFactor, 10.0f));
        this.setScaleX(mScaleFactor);
        this.setScaleY(mScaleFactor);
        return true;
    }

    @Override
    public boolean onScaleBegin(ScaleGestureDetector scaleGestureDetector) {
        return true;
    }

    @Override
    public void onScaleEnd(ScaleGestureDetector scaleGestureDetector) {
        Log.d("@@@","onScaleEnd ---- ");
    }

    @Override
    public boolean onTouch(View view, MotionEvent event) {                      // NOSONAR
        gestureDetector.onTouchEvent(event);
        //set drag listener
        switch (event.getAction() & MotionEvent.ACTION_MASK) {
            case MotionEvent.ACTION_DOWN:
                dX = getX() - event.getRawX();
                dY = getY() - event.getRawY();
                scaleValueX = dX;
                scaleValueY = dY;
                mode = DRAG;
                break;
            case MotionEvent.ACTION_MOVE:
                if (mode == DRAG || mode == ZOOM) {
                    trashView.setVisibility(VISIBLE);
                    if (event.getRawX() + getWidth() + dX > (parentX + parentViewWidth)) {
                        scaleValueX = (parentX + parentViewWidth - getWidth()) - event.getRawX();
                    } else if (event.getRawX() + dX < parentX) {
                        scaleValueX = parentX - (event.getRawX());
                    }
                    if (event.getRawY() + getHeight() + dY > parentY + parentViewHeight) {
                        scaleValueY = (parentY + parentViewHeight - getHeight()) - event.getRawY();
                    }
                    view.animate().x(event.getRawX() + scaleValueX).y(event.getRawY() + scaleValueY)
                            .setDuration(0)
                            .start();

                    if (event.getPointerCount() == 2) {

                        angle = rotation(event) - d;

                        float newDist = spacing(event);
                        if (newDist > 10f) {
                            float scale = newDist / oldDist * view.getScaleX();
                            if (scale > 0.6 && calculateScaleWithinView(scale)) {
                                if (scale < scalingLimit) {
                                    scaleDiff = scale;
                                    view.setScaleX(scale);
                                    view.setScaleY(scale);
                                } else {
                                    scaleDiff = scalingLimit;
                                    view.setScaleX(scalingLimit);
                                    view.setScaleY(scalingLimit);
                                }
                            }
                        }
                        view.animate().rotationBy(angle).setDuration(0).setInterpolator(
                                new LinearInterpolator()).start();
                    }
                } else {
                    trashView.setVisibility(GONE);
                }

                break;
            case MotionEvent.ACTION_POINTER_DOWN:
                oldDist = spacing(event);
                if (oldDist > 10f) {
                    mode = ZOOM;
                }
                d = rotation(event);
                break;
            case MotionEvent.ACTION_UP:
                if (viewsIntersect(this, trashView)) {
                    removeView();
                } else {
                    //check if view goes beyond parent view
                    if (getY() + (getHeight() / 2f) < parentY) {
                        moveViewToTrash();
                        new Handler().postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                removeView();
                            }
                        }, 600);
                    }
                }
                trashView.setVisibility(View.GONE);
                break;
            case MotionEvent.ACTION_POINTER_UP:
                mode = NONE;
                break;
            default:
                return false;
        }
        return !hasFocus();
    }

    private boolean calculateScaleWithinView(float scale) {
        return (getWidth() * scale) < parentViewWidth && (getHeight() * scale) < parentViewHeight;
    }

    private void removeView() {
        if (removeOverlayViewListener != null) {
            removeOverlayViewListener.removeOverlayView(this);
        }
    }

    private float rotation(MotionEvent event) {
        double deltaX = (event.getX(0) - event.getX(1));
        double deltaY = (event.getY(0) - event.getY(1));
        double radians = Math.atan2(deltaY, deltaX);
        return (float) Math.toDegrees(radians);
    }

    /**
     * Determines if two views intersect in the window.
     */
    public static boolean viewsIntersect(View view1, View view2) {
        if (view1 == null || view2 == null) return false;
        final int[] view1Loc = new int[2];
        view1.getLocationOnScreen(view1Loc);
        final Rect view1Rect = new Rect(view1Loc[0],
                view1Loc[1],
                (int) (view1Loc[0] + (view1.getWidth() * view1.getScaleX())),
                (int) (view1Loc[1] + (view1.getHeight() * view1.getScaleY())));
        int[] view2Loc = new int[2];
        view2.getLocationOnScreen(view2Loc);
        final Rect view2Rect = new Rect(view2Loc[0],
                view2Loc[1],
                view2Loc[0] + view2.getWidth(),
                view2Loc[1] + view2.getHeight());
        return view1Rect.intersect(view2Rect);
    }

    private void moveViewToTrash() {
        animate().x(trashView.getX() - (getWidth() / 2f))
                .y(trashView.getY()).setDuration(500)
                .start();
    }

    private float spacing(MotionEvent event) {
        float x = event.getX(0) - event.getX(1);
        float y = event.getY(0) - event.getY(1);
        return (float) Math.sqrt(x * x + y * y);
    }

    public interface OverLayListener {

        void removeOverlayView(View view);

        void updateActiveText(TextOverlayOnImage view);
    }

    //setter methods for parent view
    public void setParentViewWidth(int width) {
        this.parentViewWidth = width;
    }

    public void setParentViewHeight(int height) {
        this.parentViewHeight = height;
    }

    public void setParentX(float x) {
        this.parentX = x;
    }

    public void setParentY(float y) {
        this.parentY = y;
    }

    @Override
    public boolean onKeyPreIme(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_UP) {
            this.clearFocus();
        }
        return super.onKeyPreIme(keyCode, event);
    }
}

