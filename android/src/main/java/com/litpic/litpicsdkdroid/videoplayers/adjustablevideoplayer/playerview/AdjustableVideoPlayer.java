package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.playerview;

import android.annotation.SuppressLint;
import android.graphics.Rect;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Choreographer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.audiotrimming.AudioTrimmerView;
import com.litpic.litpicsdkdroid.audiotrimming.customviews.SoundWaveView;
import com.litpic.litpicsdkdroid.audiotrimming.interfaces.AudioTrimCompletionListener;
import com.litpic.litpicsdkdroid.trimmermodule.view.VideoViewPreview;

@SuppressLint("ViewConstructor")
public class AdjustableVideoPlayer extends FrameLayout
        implements VideoViewPreview.SizeListener, AudioTrimCompletionListener {

    private RelativeLayout mLinearVideo;

    private VideoViewPreview mVideoView;

    private Uri mSrc;

    private ThemedReactContext context;

    private PlayerListener playerListener;
    private FrameLayout tagTransViewParent;

    private int videoWidth = 0;
    private int videoHeight = 0;
    private boolean loopVideo = true;

    public void setSizeChangeListener(PlayerListener listener) {
        this.playerListener = listener;
    }

    public interface PlayerListener {

        void onSizeChanged(int width, int height);
    }

    public AdjustableVideoPlayer(@NonNull ThemedReactContext context, AttributeSet attrs,
                                 int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    public AdjustableVideoPlayer(ThemedReactContext reactContext) {
        this(reactContext, null, 0);
    }

    public AdjustableVideoPlayer(ThemedReactContext context, AttributeSet attributes) {
        this(context, attributes, 0);
    }

    private void init(ThemedReactContext context) {
        this.context = context;

        LayoutInflater.from(context).inflate(R.layout.adjustable_video_player, this, true);

        mLinearVideo = findViewById(R.id.adjustableContainer);
        mVideoView = findViewById(R.id.adjustable_video_view);
        tagTransViewParent = findViewById(R.id.tag_tans_view);

        mVideoView.setSizeListener(this);

        installHierarchyFitter(mLinearVideo);

        if (mSrc != null && mVideoView != null) {
            mVideoView.setVideoURI(context,mSrc);
            mVideoView.requestFocus();
            mVideoView.start();
        }
        setUpListeners();
        setupLayoutHack();

        this.requestLayout();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        if (mVideoView.isPlaying()) {
            mVideoView.stopPlayback();
        }
    }

    private void setUpListeners() {
        mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                onVideoPrepared(mp);
            }
        });
    }

    private void onVideoPrepared(@NonNull MediaPlayer mp) {
        // Adjust the size of the video
        // so it fits on the screen
        int videoWidthLocal = mp.getVideoWidth();
        int videoHeightLocal = mp.getVideoHeight();
        videoWidth = mp.getVideoWidth();
        videoHeight = mp.getVideoHeight();
        float videoProportion = (float) videoWidthLocal / (float) videoHeightLocal;
        int screenWidth = mLinearVideo.getWidth();
        int screenHeight = mLinearVideo.getHeight();
        float screenProportion = (float) screenWidth / (float) screenHeight;
        ViewGroup.LayoutParams lp = mVideoView.getLayoutParams();

        if (videoProportion > screenProportion) {
            lp.width = screenWidth;
            lp.height = (int) ((float) screenWidth / videoProportion);
        } else {
            lp.width = (int) (videoProportion * (float) screenHeight);
            lp.height = screenHeight;
        }

        mVideoView.setLayoutParams(lp);
        mp.setLooping(loopVideo);
        mp.start();
    }

    public void setVideoDetails(ReadableMap details) {
        Log.d("@@@", "setVideoDetails - >" + details);
    }

    public void setVideoPath(Uri videoPath) {
        mSrc = videoPath;
        if (mVideoView != null && mSrc != null) {
            initVideoView();
        }
    }

    public void seekTo(int position) {
        mVideoView.seekTo(position);
    }

    @Override
    public void onAudioTrimmingCompleted(String outputPath) {
        //audio trimming completed
        Log.d("@@@", "onAudioTrimmingCompleted->" + outputPath);
    }

    private void installHierarchyFitter(ViewGroup view) {
        if (context != null) {
            view.setOnHierarchyChangeListener(new OnHierarchyChangeListener() {
                @Override
                public void onChildViewAdded(View parent, View view1) {
                    parent.measure(MeasureSpec
                                    .makeMeasureSpec(parent.getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                            MeasureSpec.makeMeasureSpec(parent.getMeasuredHeight(),
                                    MeasureSpec.UNSPECIFIED));
                    parent.layout(parent.getLeft(), parent.getRight(), parent.getMeasuredWidth(),
                            parent.getMeasuredHeight());
                }

                @Override
                public void onChildViewRemoved(View view, View view1) {
                    Log.d("@@@", "onChildViewRemoved");
                }
            });
        }
    }

    private void initVideoView() {
        if (mSrc != null && mVideoView != null) {
            mVideoView.stopPlayback();

            mVideoView.setVideoURI(context,mSrc);
            mVideoView.requestFocus();
        }
    }

    @Override
    public void onSizeChanged(int width, int height) {
        if (playerListener != null) {
            playerListener.onSizeChanged(width, height);
        }
    }

    public FrameLayout getTagTransView() {
        return tagTransViewParent;
    }

    public void getVideoViewDrawingRect(Rect drawingRect) {
        mVideoView.getDrawingRect(drawingRect);
    }

    public int getVideoViewWidth() {
        return mVideoView.getVideoWidth();
    }

    public int getVideoViewHeight() {
        return mVideoView.getVideoHeight();
    }


    public float getVideoViewX() {
        return mVideoView.getVideoX();
    }

    public float getVideoViewY() {
        return mVideoView.getVideoY();
    }

    public int getMeasuredWidthOfVideoView() {
        return mVideoView.getMeasuredWidth();
    }

    public int getMeasuredHeightOfVideoView() {
        return mVideoView.getMeasuredHeight();
    }

    public void isLoopVideo(boolean loopVideo) {
        this.loopVideo = loopVideo;
    }

    public int getVideoWidth() {
        return videoWidth;
    }

    public int getVideoHeight() {
        return videoHeight;
    }

    public void playVideo() {
        if (!mVideoView.isPlaying()) {
            mVideoView.resume();
        }
    }

    public void pauseVideo() {
        if (mVideoView.isPlaying()) {
            mVideoView.pause();
        }
    }

    void setupLayoutHack() {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren();
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    void manuallyLayoutChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child instanceof AudioTrimmerView || child instanceof SoundWaveView) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
            }
        }
    }
}