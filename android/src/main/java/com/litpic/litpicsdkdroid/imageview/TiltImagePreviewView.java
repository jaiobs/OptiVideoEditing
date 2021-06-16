package com.litpic.litpicsdkdroid.imageview;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.BitmapFactory;
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
import com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.rn.DisplayInfo;
import com.litpic.litpicsdkdroid.videoplayers.scrollablevideoplayer.rn.DisplayOrientationDetector;

import java.io.File;
import java.util.Objects;

import static com.litpic.litpicsdkdroid.config.Constants.FILE_PREFIX_TWO;

@SuppressLint("ViewConstructor")
public class TiltImagePreviewView extends FrameLayout implements SensorEventListener {

    private final ThemedReactContext context;

    private HorizontalScrollView scrollView;
    private TiltImageView scrollImageView;
    private DisplayOrientationDetector mDisplayOrientationDetector;
    private String imagePath;

    private int imageHeight;
    private int imageWidth;
    private int cropPosition = 0;

    public TiltImagePreviewView(ThemedReactContext reactContext) {
        this(reactContext, null);
    }

    public TiltImagePreviewView(ThemedReactContext context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public TiltImagePreviewView(ThemedReactContext context, @Nullable AttributeSet attrs,
                                int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;
        initUi();
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

    private void initUi() {
        LayoutInflater.from(context).inflate(R.layout.scrollable_image_view, this, true);

        scrollImageView = findViewById(R.id.scrollable_image_view);
        scrollView = findViewById(R.id.scrollview_horizontal_image);

        scrollImageView.setDeviceHeight(new DisplayInfo(context).getScreenHeight());
        scrollImageView.setDeviceWidth(new DisplayInfo(context).getScreenWidth());

        SensorManager sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        Sensor sensorAccelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);

        sensorManager.registerListener(this, sensorAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);

        if (imageWidth > 0 && imageHeight > 0) {
            scrollImageView.setImageHeightAndWidth(imageWidth, imageHeight);
        }

        if (imagePath != null && scrollImageView != null) {
            initImageView();
        }

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
                } else {
                    //landscape do nothing as of now
                    Log.d("@@@", "onDisplayOrientationChanged - else part");
                }
            }
        };
        releaseOrientation();
    }

    private void releaseOrientation() {
        if (context != null && context.getCurrentActivity() != null) {
            context.getCurrentActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
        setImageDetails(imagePath);
        initImageView();
    }

    private void setImageDetails(String imgPath) {
        try {
            if (imgPath.contains(FILE_PREFIX_TWO)) {
                imgPath = imgPath.replace(FILE_PREFIX_TWO, "");
            }

            File videoFile = new File(imgPath);

            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;

            BitmapFactory.decodeFile(videoFile.getPath(), options);
            imageWidth = options.outWidth;
            imageHeight = options.outHeight;

            scrollImageView.setImageHeightAndWidth(imageWidth, imageHeight);
        } catch (Exception e) {
            Log.d("@@@", "exception - ", e);
        }
    }

    public void setImageDetails(ReadableMap details) {
        Log.d("@@@", "setImageDetails ----------  " + details);
    }

    public void setCropPosition(int xPosition) {
        cropPosition = xPosition;
        Log.d("@@@", "x position" + xPosition);
    }

    private void initImageView() {
        ViewGroup.LayoutParams lp = scrollImageView.getLayoutParams();

        lp.height = imageHeight;
        lp.width = imageWidth;

        scrollImageView.setLayoutParams(lp);

        if (imagePath != null && !TextUtils.isEmpty(imagePath)) {
            scrollImageView.setImageURI(Uri.parse(imagePath));
            scrollImageView.bringToFront();
            scrollImageView.requestFocus();
        }

        if (scrollView != null) {
            scrollView.postDelayed(new Runnable() {
                @Override
                public void run() {
                    scrollView.smoothScrollBy(cropPosition, 0);
                }
            }, 200);

            scrollView.getViewTreeObserver().addOnScrollChangedListener(
                    new ViewTreeObserver.OnScrollChangedListener() {
                        @Override
                        public void onScrollChanged() {
                            Log.d("Scrolling", "" + scrollView.getScrollX());
                        }
                    });
        }

    }

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        int x = (int) sensorEvent.values[0] * -10;
        if (x != 0) {
            scrollView.smoothScrollBy(x, 0);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {
        Log.d("@@@", "onAccuracyChanged");
    }
}
