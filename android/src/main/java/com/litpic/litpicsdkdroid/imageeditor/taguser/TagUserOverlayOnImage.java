package com.litpic.litpicsdkdroid.imageeditor.taguser;

import android.content.Context;
import android.graphics.Rect;
import android.os.Handler;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.view.animation.LinearInterpolator;

import androidx.appcompat.widget.AppCompatImageView;

import com.litpic.litpicsdkdroid.imageeditor.textoverlay.TextOverlayOnImage;

import java.util.Map;

public class TagUserOverlayOnImage extends AppCompatImageView
        implements ScaleGestureDetector.OnScaleGestureListener, View.OnTouchListener {

    float dX;
    float dY;
    float angle = 0;
    private float mScaleFactor = 1.0f;
    private float d = 0f;
    private AppCompatImageView trashView;
    TextOverlayOnImage.OverLayListener removeOverlayViewListener;
    int screenWidth;
    int screenHeight;
    static final int NONE = 0;
    static final int DRAG = 1;
    static final int ZOOM = 2;
    int mode = NONE;
    float oldDist = 1f;
    float scaleDiff;
    float scalingLimit = 5.0f;

    int parentViewWidth;
    int parentViewHeight;
    float parentX;
    float parentY;
    float scaleValueX = 0f;
    float scaleValueY = 0f;
    private Map<String,Object> userData;

    public TagUserOverlayOnImage(Context context) {
        this(context, null);
    }

    public TagUserOverlayOnImage(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView(context);
    }

    public TagUserOverlayOnImage(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    private void initView(Context context) {
        //init scale listener
        setOnTouchListener(this);
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        screenWidth = displayMetrics.widthPixels;
        screenHeight = displayMetrics.heightPixels;
    }

    public void setUserData(Map<String,Object> map){
        this.userData = map;
    }

    public Map<String,Object> getUserData(){
        return userData;
    }

    public void setTrashView(AppCompatImageView view) {
        this.trashView = view;
    }

    public void setRemoveOverlayViewListener(TextOverlayOnImage.OverLayListener removeOverlayViewListener) {
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
        /*no-op*/
    }

    @Override
    public boolean onTouch(View view, MotionEvent event) {                      // NOSONAR
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

                        float newRot = rotation(event);
                        angle = newRot - d;

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
        return true;
    }

    private void removeView() {
        if (removeOverlayViewListener != null) {
            removeOverlayViewListener.removeOverlayView(this);
        }
    }

    private boolean calculateScaleWithinView(float scale) {
        return (getWidth() * scale) < parentViewWidth && (getHeight() * scale) < parentViewHeight;
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

    private float spacing(MotionEvent event) {
        float x = event.getX(0) - event.getX(1);
        float y = event.getY(0) - event.getY(1);
        return (float) Math.sqrt(x * x + y * y);
    }

    private void moveViewToTrash() {
        animate().x(trashView.getX() - (getWidth() / 2f))
                .y(trashView.getY()).setDuration(500)
                .start();
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
}
