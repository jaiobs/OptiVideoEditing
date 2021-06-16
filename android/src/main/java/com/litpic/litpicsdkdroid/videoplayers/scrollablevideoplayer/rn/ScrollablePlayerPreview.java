package com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.rn;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;

import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.litpic.litpicsdkdroid.R;
import com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.view.ScrollablePlayer;

import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.HEIGHT;
import static com.litpic.litpicsdkdroid.config.Constants.WIDTH;

public class ScrollablePlayerPreview extends FrameLayout implements SensorEventListener {

	private ScrollablePlayer videoView;

	private String videoPathUri;

	private HorizontalScrollView scrollView;

	private int videoHeight;
	private int videoWidth;
	private int cropPosition = 0;

	private DisplayOrientationDetector mDisplayOrientationDetector;

	public ScrollablePlayerPreview(ThemedReactContext reactContext) {
		this(reactContext, null);
	}

	public ScrollablePlayerPreview(Context context, @Nullable AttributeSet attrs) {
		this(context, attrs, 0);
	}

	public ScrollablePlayerPreview(Context context, @Nullable AttributeSet attrs,
			int defStyleAttr) {
		super(context, attrs, defStyleAttr);
		init(context);
	}

	@Override
	protected void onAttachedToWindow() {
		super.onAttachedToWindow();
		mDisplayOrientationDetector.enable(Objects.requireNonNull(ViewCompat.getDisplay(this)));
	}

	@Override
	protected void onDetachedFromWindow() {
		super.onDetachedFromWindow();
		mDisplayOrientationDetector.disable();
	}

	private void init(Context context) {
		LayoutInflater.from(context).inflate(R.layout.scrollable_player_preview, this, true);

		videoView = findViewById(R.id.scrollable_player);
		scrollView = findViewById(R.id.scrollview_horizontal);

		videoView.setDeviceHeight(new DisplayInfo(context).getScreenHeight());

		SensorManager sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
		Sensor sensorAccelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);

		sensorManager.registerListener(this, sensorAccelerometer, SensorManager.SENSOR_DELAY_GAME);

		mDisplayOrientationDetector = new DisplayOrientationDetector(context) {
			@Override
			public void onDisplayOrientationChanged(int displayOrientation, int deviceOrientation) {
				if (deviceOrientation == 0) {
					if (scrollView != null && cropPosition != 0) {
						scrollView.postDelayed(new Runnable() {
							@Override
							public void run() {
								scrollView.smoothScrollBy(cropPosition, 0);
							}
						}, 200);
					}
				}
				else {
					//landscape do nothing as of now
					Log.d("@@@","onDisplayOrientationChanged -- else part");
				}
			}
		};
	}

	public void setVideoPath(String videoPath) {
		videoPathUri = videoPath;
		if (videoView != null && videoPathUri != null) {
			initVideoView();
		}
	}

	public void setVideoDetails(ReadableMap details) {
		if (details != null) {
			videoWidth = Integer.parseInt(Objects.requireNonNull(details.getString(WIDTH)));
			videoHeight = Integer.parseInt(Objects.requireNonNull(details.getString(HEIGHT)));
		}
	}

	private void initVideoView() {

		ViewGroup.LayoutParams lp = videoView.getLayoutParams();

		lp.height = videoHeight;
		lp.width = videoWidth;

		videoView.setLayoutParams(lp);

		if (videoPathUri != null && !TextUtils.isEmpty(videoPathUri)) {
			videoView.setVideoURI(Uri.parse(videoPathUri));
			videoView.requestFocus();
			videoView.start();
		}

		if (scrollView != null) {
			scrollView.postDelayed(new Runnable() {
				@Override
				public void run() {
					scrollView.smoothScrollBy(cropPosition, 0);
				}
			}, 200);
		}

		if (scrollView != null) {
			scrollView.getViewTreeObserver().addOnScrollChangedListener(
					new ViewTreeObserver.OnScrollChangedListener() {
						@Override
						public void onScrollChanged() {
							Log.d("Scrolling", "" + scrollView.getScrollX());
						}
					});
		}

	}

	public void setCropPosition(int xPosition) {
		cropPosition = xPosition;
	}

	@Override
	public void onSensorChanged(SensorEvent sensorEvent) {
		int x = (int) sensorEvent.values[0] * -10;
		scrollView.smoothScrollBy(x, 0);
		videoView.start();
	}

	@Override
	public void onAccuracyChanged(Sensor sensor, int i) {
		Log.d("@@@", "onAccuracyChanged");
	}
}
