package com.litpic.litpicsdkdroid.audiotrimming.customviews;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.net.Uri;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import androidx.annotation.ColorRes;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import com.litpic.litpicsdkdroid.R;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import com.litpic.litpicsdkdroid.utils.FileUtils;

public class SoundVisualizerBarView extends View {

    /**
     * constant value for Height of the bar
     */
    public static final int VISUALIZER_HEIGHT = 100;

    /**
     * bytes array converted from file.
     */
    private byte[] bytes;

    /**
     * Percentage of audio sample scale
     * Should updated dynamically while audioPlayer is played
     */
    private float denseness;

    /**
     * Canvas painting for sample scale, filling played part of audio sample
     */
    private final Paint playedStatePainting = new Paint();
    /**
     * Canvas painting for sample scale, filling not played part of audio sample
     */
    private final Paint notPlayedStatePainting = new Paint();

    private int width;
    private int height;

    private int playedStateColor;
    private int nonPlayedStateColor;

    private int mHeightView;

    public SoundVisualizerBarView(Context context) {
        super(context);
        init();
    }

    public SoundVisualizerBarView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);

        playedStateColor = ContextCompat.getColor(context, R.color.colorGridLine);
        nonPlayedStateColor = ContextCompat.getColor(context, R.color.white);

        init();
    }

    public void setPlayedStateColor(@ColorRes int playedStateColor) {
        this.playedStateColor = playedStateColor;
    }

    public void setNonPlayedStateColor(@ColorRes int nonPlayedStateColor) {
        this.nonPlayedStateColor = nonPlayedStateColor;
    }

    private void init() {
        bytes = null;

        playedStatePainting.setStrokeWidth(1f);
        playedStatePainting.setAntiAlias(true);
        playedStatePainting.setColor(playedStateColor);
        notPlayedStatePainting.setStrokeWidth(1f);
        notPlayedStatePainting.setAntiAlias(true);
        notPlayedStatePainting.setColor(nonPlayedStateColor);

        mHeightView = getContext().getResources().getDimensionPixelOffset(R.dimen.audio_wave_height);
    }

    /**
     * update and redraw Visualizer view
     */
    public void updateVisualizer(Uri uri) throws FileNotFoundException {
        File file = new File(String.valueOf(uri));
        updateVisualizer(file);
    }
    public void updateVisualizer(File file) {
        this.bytes = FileUtils.fileToBytes(file);
        invalidate();
    }
    /**
     * update and redraw Visualizer view
     */
    public void updateVisualizer(String url) throws IOException {
        File file = new File(url);
        updateVisualizer(file);
    }

    /**
     * update and redraw Visualizer view
     */
    public void updateVisualizer(InputStream inputStream) {
        this.bytes = readInputStream(inputStream);
        invalidate();
    }

    /**
     * update and redraw Visualizer view
     */
    public void updateVisualizer(byte[] bytes) {
        this.bytes = bytes;
        invalidate();
    }

    /**
     * Update player percent. 0 - file not played, 1 - full played
     *
     * @param percent
     */
    public void updatePlayerPercent(float percent) {
        denseness = (int) Math.ceil(width * percent);
        if (denseness < 0) {
            denseness = 0;
        } else if (denseness > width) {
            denseness = width;
        }
        invalidate();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        width = getMeasuredWidth();
        height = getMeasuredHeight();
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
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (bytes == null || width == 0) {
            return;
        }
        int samplesCount = (bytes.length * 8 / 5);
        float dpValue = ((width * 1.0f) / samplesCount);
        float totalBarsCount = (width * 1.0f) / dp(dpValue);
        if (totalBarsCount <= 0.1f) {
            return;
        }
        byte value;

        float samplesPerBar = samplesCount / totalBarsCount;
        float barCounter = 0;
        int nextBarNum = 0;

        int y = (int) (height - dp(VISUALIZER_HEIGHT));
        int x = (height / 2);
        int barNum = 0;
        int lastBarNum;
        int drawBarCount;

        for (int a = 0; a < samplesCount; a++) {
            if (a != nextBarNum) {
                continue;
            }
            drawBarCount = 0;
            lastBarNum = nextBarNum;
            while (lastBarNum == nextBarNum) {
                barCounter += samplesPerBar;
                nextBarNum = (int) barCounter;
                drawBarCount++;
            }

            int bitPointer = a * 5;
            int byteNum = bitPointer / Byte.SIZE;
            int byteBitOffset = bitPointer - byteNum * Byte.SIZE;
            int currentByteCount = Byte.SIZE - byteBitOffset;
            int nextByteRest = 5 - currentByteCount;
            value = (byte) ((bytes[byteNum] >> byteBitOffset) & ((2 << (Math.min(5, currentByteCount) - 1)) - 1));
            if (nextByteRest > 0) {
                value <<= nextByteRest;
                value |= bytes[byteNum + 1] & ((2 << (nextByteRest - 1)) - 1);
            }

            for (int b = 0; b < drawBarCount; b++) {
                float left = barNum * dp(dpValue);
                float right = left + dp(dpValue);
                float waveTwo = y + dp(Math.min(VISUALIZER_HEIGHT, value));
                if (left < denseness || left + dp(dpValue) < denseness) {
                    canvas.drawRect(left, x - waveTwo, right, (x + waveTwo), playedStatePainting);
                } else {
                    canvas.drawRect(left, x - waveTwo, right, (x + waveTwo), notPlayedStatePainting);
                }
                barNum++;
            }
        }
    }

    public float dp(float value) {
        if (value == 0) {
            return 0;
        }
        return (float) Math.ceil(getContext().getResources().getDisplayMetrics().density * value);
    }

    private byte[] readInputStream(InputStream inputStream) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        byte[] buf = new byte[1024];
        int len;
        try {
            while ((len = inputStream.read(buf)) != -1) {
                outputStream.write(buf, 0, len);
            }
            outputStream.close();
            inputStream.close();
        } catch (IOException e) {
            Log.d("@@@","Exception - ",e);
        }
        return outputStream.toByteArray();
    }
}
