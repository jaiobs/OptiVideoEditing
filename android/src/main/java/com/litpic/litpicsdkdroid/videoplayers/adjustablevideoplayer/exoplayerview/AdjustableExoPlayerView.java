package com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.PlaybackParameters;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.Renderer;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.Timeline;
import com.google.android.exoplayer2.source.TrackGroupArray;
import com.google.android.exoplayer2.trackselection.TrackSelectionArray;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.utils.MediaUtils;

import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;

@SuppressLint("ViewConstructor")
public class AdjustableExoPlayerView extends RelativeLayout {

    private ThemedReactContext context;
    private SimpleExoPlayer videoPlayer;
    private VideoPlayerView videoPlayerView;
    private String videoPath;
    private int duration;
    private int videoWidth;
    private int videoHeight;
    private final ReactApplicationContext reactAppContext;
    private int updatedStartPosition;
    private int updatedEndPosition;
    private float updatedPlaybackSpeed;
    LifecycleEventListener lifeCycleListener;

    public AdjustableExoPlayerView(@NonNull ThemedReactContext context, ReactApplicationContext reactApplicationContext) {
        super(context);
        reactAppContext = reactApplicationContext;
        initView(context);
    }

    private void initView(ThemedReactContext reactContext) {
        this.context = reactContext;
        initPlayer();
        initLifeCycleListener();

        setDefaultMediaResource();

        this.requestLayout();
        lockOrientation();
    }

    private void setDefaultMediaResource() {
        if (videoPath != null && videoPlayer != null) {
            MediaItem firstPart = new MediaItem.Builder().setUri(videoPath).build();
            videoPlayer.clearMediaItems();
            videoPlayer.addMediaItem(firstPart);
            videoPlayer.prepare();
            videoPlayer.setPlayWhenReady(true);
            videoPlayer.play();
        }
    }

    private void lockOrientation() {
        if (context != null && context.getCurrentActivity() != null && context.getCurrentActivity().getRequestedOrientation() == ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
            int currentOrientation = getResources().getConfiguration().orientation;
            if (currentOrientation == Configuration.ORIENTATION_LANDSCAPE) {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else {
                context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            }
        }
    }

    private void initPlayer() {
        videoPlayer = new SimpleExoPlayer.Builder(context).build();
        videoPlayerView = new VideoPlayerView(context);
        LayoutParams layoutParams = new LayoutParams(WRAP_CONTENT,
                WRAP_CONTENT);
        layoutParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);
        videoPlayerView.setLayoutParams(layoutParams);
        videoPlayerView.setControllerAutoShow(false);
        this.addView(videoPlayerView);
        videoPlayerView.bringToFront();
        videoPlayerView.setPlayer(videoPlayer);
        videoPlayer.setRepeatMode(Player.REPEAT_MODE_ONE);
        videoPlayer.setPlayWhenReady(true);
        videoPlayer.setVideoScalingMode(Renderer.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING);
        videoPlayer.addListener(new Player.EventListener() {
            @Override
            public void onTimelineChanged(Timeline timeline, int reason) {
                /* on playlist changes */
                Log.d("@@@", "onTimelineChanged - > " + reason);
            }

            @Override
            public void onMediaItemTransition(@Nullable MediaItem mediaItem, int reason) {
                /* on media item changes */
                if (mediaItem != null && mediaItem.clippingProperties != null &&
                        mediaItem.clippingProperties.startPositionMs == updatedStartPosition &&
                        mediaItem.clippingProperties.endPositionMs == updatedEndPosition) {
                    PlaybackParameters playbackParameters = new PlaybackParameters(updatedPlaybackSpeed);
                    videoPlayer.setPlaybackParameters(playbackParameters);
                } else {
                    PlaybackParameters playbackParameters = new PlaybackParameters(1f);
                    videoPlayer.setPlaybackParameters(playbackParameters);
                }
            }

            @Override
            public void onTracksChanged(TrackGroupArray trackGroups, TrackSelectionArray trackSelections) {
                Log.d("@@@", "onTracksChanged - > ");
            }

            @Override
            public void onIsLoadingChanged(boolean isLoading) {
                Log.d("@@@", "onIsLoadingChanged - > " + isLoading);
            }

            @Override
            public void onPlaybackStateChanged(int state) {
                Log.d("@@@", "onPlaybackStateChanged - > " + state);
            }

            @Override
            public void onPlayWhenReadyChanged(boolean playWhenReady, int reason) {
                Log.d("@@@", "onPlayWhenReadyChanged - > " + reason);
            }

            @Override
            public void onPlaybackSuppressionReasonChanged(int playbackSuppressionReason) {
                Log.d("@@@", "onPlaybackSuppressionReasonChanged - > " + playbackSuppressionReason);
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                Log.d("@@@", "onIsPlayingChanged - > " + isPlaying);
            }

            @Override
            public void onRepeatModeChanged(int repeatMode) {
                Log.d("@@@", "onRepeatModeChanged - > " + repeatMode);
            }

            @Override
            public void onShuffleModeEnabledChanged(boolean shuffleModeEnabled) {
                Log.d("@@@", "onShuffleModeEnabledChanged - > " + shuffleModeEnabled);
            }

            @Override
            public void onPlayerError(ExoPlaybackException error) {
                Log.d("@@@", "onPlayerError - > " + error);
            }

            @Override
            public void onPositionDiscontinuity(int reason) {
                Log.d("@@@", "onPositionDiscontinuity - > " + reason);
            }

            @Override
            public void onPlaybackParametersChanged(PlaybackParameters playbackParameters) {
                Log.d("@@@", "onPlaybackParametersChanged - > " + playbackParameters);
            }

            @Override
            public void onExperimentalOffloadSchedulingEnabledChanged(boolean offloadSchedulingEnabled) {
                Log.d("@@@", "onExperimentalOffloadSchedulingEnabledChanged - > " + offloadSchedulingEnabled);
            }
        });
    }

    private void initLifeCycleListener() {
        lifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                resumeVideo();
            }

            @Override
            public void onHostPause() {
                pausePlayer();
            }

            @Override
            public void onHostDestroy() {
                stopVideo();
            }
        };
        reactAppContext.addLifecycleEventListener(lifeCycleListener);
    }

    public void setVideoDetails(ReadableMap details) {
        String width = "";
        String height = "";
        if (details.hasKey(Constants.VIDEO_WIDTH)) {
            width = details.getString(Constants.VIDEO_WIDTH);
        } else if (details.hasKey(Constants.WIDTH)) {
            width = details.getString(Constants.WIDTH);
        }

        if (details.hasKey(Constants.VIDEO_HEIGHT)) {
            height = details.getString(Constants.VIDEO_HEIGHT);
        } else if (details.hasKey(Constants.HEIGHT)) {
            height = details.getString(Constants.HEIGHT);
        }

        if (width == null || width.isEmpty()) width = String.valueOf(Constants.PIXELS_9);
        if (height == null || height.isEmpty()) height = String.valueOf(Constants.PIXELS_16);

        if (MediaUtils.isAnamorphic(context, videoPath)) {
            videoHeight = Integer.parseInt(width);
            videoWidth = Integer.parseInt(height);
        } else {
            videoWidth = Integer.parseInt(width);
            videoHeight = Integer.parseInt(height);
        }
    }

    public void setVideoPath(String videoUrl) {
        this.videoPath = videoUrl;
        duration = MediaUtils.getVideoDuration(context, videoPath);
        setDefaultMediaResource();
    }

    public void setUpPlayerView() {
        if (videoPlayerView != null) {
            videoPlayerView.setVideoWidthAndHeight(videoWidth, videoHeight);
            this.requestLayout();
        }
    }

    public void seekTo(ReadableMap readableArray) {
        seekTo(readableArray.getInt(Constants.START_POSITION));
    }

    public void seekTo(int position) {
        if (videoPlayer != null) {
            videoPlayer.seekTo(position);
        }
    }

    public void updatePreviewVideo(ReadableMap readableArray) {
        updatedStartPosition = readableArray.getInt(Constants.START_POSITION);
        updatedEndPosition = readableArray.getInt(Constants.END_POSITION);
        String speedValue = readableArray.getString(Constants.SPEED_VALUE);
        updatedPlaybackSpeed = getSpeedValue(speedValue);
        videoPlayer.setRepeatMode(Player.REPEAT_MODE_ALL);
        videoPlayer.stop();
        videoPlayer.clearMediaItems();
        if (updatedStartPosition != updatedEndPosition) {
            int i = 0;
            if (updatedStartPosition > 0) {
                MediaItem firstPart = new MediaItem.Builder().setUri(videoPath)
                        .setClipStartPositionMs(0).setClipEndPositionMs(updatedStartPosition).build();
                videoPlayer.addMediaItem(i, firstPart);
                i++;
            }
            MediaItem mediaItem = new MediaItem.Builder().setUri(videoPath).setTag(speedValue)
                    .setClipStartPositionMs(updatedStartPosition).setClipEndPositionMs(updatedEndPosition).build();
            videoPlayer.addMediaItem(i, mediaItem);
            i++;
            if (updatedEndPosition < duration) {
                MediaItem endPart = new MediaItem.Builder().setUri(videoPath)
                        .setClipStartPositionMs(updatedEndPosition).setClipEndPositionMs(duration).build();
                videoPlayer.addMediaItem(i, endPart);
            }
            videoPlayer.prepare();
            videoPlayer.setPlayWhenReady(true);
            videoPlayer.play();
        } else {
            setDefaultMediaResource();
        }
    }

    private float getSpeedValue(String speed) {
        if (speed == null || speed.isEmpty()) return 1.0f;
        switch (speed) {
            case "slow1":
                return 0.75f;
            case "slow2":
                return 0.5f;
            case "fast1":
                return 1.5f;
            case "fast2":
                return 2.0f;
            default:
                return 1.0f;
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        stopVideo();
    }

    public void releasePlayer() {
        if (videoPlayer != null) {
            videoPlayer.release();
        }
    }

    private void resumeVideo() {
        if (videoPlayer != null) {
            videoPlayer.setPlayWhenReady(true);
            videoPlayer.play();
        }
    }

    private void pausePlayer() {
        if (videoPlayer != null) {
            videoPlayer.pause();
        }
    }

    private void stopVideo() {
        if (videoPlayer != null) {
            videoPlayer.stop();
            videoPlayer.setPlayWhenReady(false);
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
            if (child instanceof VideoPlayerView) {
                child.measure(
                        MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.UNSPECIFIED),
                        MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.UNSPECIFIED));
                child.layout(child.getLeft(), child.getTop(), child.getMeasuredWidth(),
                        child.getMeasuredHeight());
            }
        }
    }

    public void releaseLifeCycleListener() {
        reactAppContext.removeLifecycleEventListener(lifeCycleListener);
    }

	/**
	 * @param isVideoProcessing true when video processed with ffmpeg
	 */
	public void setVideoProcessingStatus(Boolean isVideoProcessing) {
		if (isVideoProcessing) {
			pausePlayer();
		}else{
			resumeVideo();
		}
	}
}
