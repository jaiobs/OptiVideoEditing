package com.litpic.litpicsdkdroid.filtertovideo.view;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;
import android.widget.FrameLayout;

import androidx.annotation.Nullable;

import com.daasuu.gpuv.player.GPUPlayerView;
import com.daasuu.gpuv.player.PlayerScaleType;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.PlaybackParameters;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.Renderer;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.Timeline;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.ProgressiveMediaSource;
import com.google.android.exoplayer2.source.TrackGroupArray;
import com.google.android.exoplayer2.trackselection.TrackSelectionArray;
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.videoplayers.adjustablevideoplayer.exoplayerview.VideoPlayerView;

import static com.litpic.litpicsdkdroid.filtertovideo.FilterUtility.getFilter;

@SuppressLint("ViewConstructor")
public class GPUFilterVideoPlayerView extends FrameLayout {

    private final ThemedReactContext context;
    private SimpleExoPlayer videoPlayer;
    private String videoPath;
    private GPUPlayerView gpuPlayerView;
    LifecycleEventListener lifeCycleListener;

    public GPUFilterVideoPlayerView(ThemedReactContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        initPlayer();

        setDefaultMediaResource();
        initLifeCycle();

        this.requestLayout();
        lockOrientation();
    }

    private void initLifeCycle() {
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
                releasePlayer();
            }
        };
        context.addLifecycleEventListener(lifeCycleListener);
    }

    private void setDefaultMediaResource() {
        if (videoPath != null && videoPlayer != null) {
            videoPlayer.setMediaSource(buildMediaSource(videoPath));
            videoPlayer.prepare();
            videoPlayer.setPlayWhenReady(true);
            videoPlayer.play();
        }
    }

    private MediaSource buildMediaSource(String videoPath) {
        return
                new ProgressiveMediaSource.Factory(new DefaultDataSourceFactory(context, Constants.APP_NAME))
                        .createMediaSource(new MediaItem.Builder().setUri(videoPath).build());
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

    private void setUoGlPlayerView(SimpleExoPlayer player) {
        gpuPlayerView = new GPUPlayerView(context);
        gpuPlayerView.setSimpleExoPlayer(player);
        gpuPlayerView.setPlayerScaleType(PlayerScaleType.RESIZE_NONE);
        addView(gpuPlayerView);
        gpuPlayerView.onResume();
    }

    private void initPlayer() {
        videoPlayer = new SimpleExoPlayer.Builder(context).build();
        setUoGlPlayerView(videoPlayer);

        videoPlayer.setRepeatMode(Player.REPEAT_MODE_ONE);
        videoPlayer.setPlayWhenReady(false);
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
                Log.e("@@@", "onMediaItemTransition --- ");
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

    public void setVideoDetails(ReadableMap details) {
        Log.d("@@@", "setVideoDetails - " + details);
    }

    public void setVideoPath(String videoUrl) {
        this.videoPath = videoUrl;
        setDefaultMediaResource();
    }

    public void seekTo(ReadableMap readableArray) {
        seekTo(readableArray.getInt(Constants.START_POSITION));
    }

    public void seekTo(int position) {
        if (videoPlayer != null) {
            videoPlayer.seekTo(position);
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

    public void setFilter(ReadableMap filterValues) {
        gpuPlayerView.setGlFilter(getFilter(filterValues));
    }

    public void releaseListeners() {
        context.removeLifecycleEventListener(lifeCycleListener);
    }

	/**
	 * @param isProcessing true when video processed with ffmpeg
	 */
	public void setPlayerState(Boolean isProcessing) {
		if (isProcessing) {
			pausePlayer();
		}
		else {
			resumeVideo();
		}
	}
}
