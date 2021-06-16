package com.litpic.litpicsdkdroid.imageeditor.customview;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.core.content.ContextCompat;

import com.litpic.litpicsdkdroid.R;

public class ImageCropperView extends View {

	private int mCropperWidth = 1;
	private int mCropperHeight = 1;

	int maxWidth = 0;

	float margin = 0f;

	private float dX;
	private int imageWidth;

	private ImageCropperInterface imageCropperInterface;

	public void setCropperListener(ImageCropperInterface cropperInterface) {
		this.imageCropperInterface = cropperInterface;
	}

	public interface ImageCropperInterface {

		void onImageCropPositionChanged(int position);
	}

	public ImageCropperView(Context context, int width, int height) {
		super(context);
		init(width, height, context);
	}

	public ImageCropperView(Context context) {
		super(context);
	}

	public ImageCropperView(Context context, AttributeSet attrs) {
		super(context, attrs);
	}

	public ImageCropperView(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);
	}

	private void init(int width, int height, Context context) {
		setLayoutParams(new ViewGroup.LayoutParams(width, height));
		setBackground(ContextCompat.getDrawable(context, R.drawable.dotted_border));
		requestLayout();
	}

	public void setSize(int width, int height) {
		mCropperWidth = width;
		mCropperHeight = height;
		this.requestLayout();
	}

	public void setTopRegion(int x, int y) {
		this.animate().x(x).y(y).setDuration(0).start();
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		int width = getDefaultSize(mCropperWidth, widthMeasureSpec);
		int height = getDefaultSize(mCropperHeight, heightMeasureSpec);

		setMeasuredDimension(width, height);
	}

	@Override
	public boolean onTouchEvent(MotionEvent event) {

		margin = isExceedBoundary(event.getRawX() + dX) ? margin : event.getRawX() + dX;

		float imagePosition = ((imageWidth * 1.0f) / maxWidth) * margin;

		imageCropperInterface.onImageCropPositionChanged((int) imagePosition);

		switch (event.getAction()) {

			case MotionEvent.ACTION_DOWN:
				dX = isExceedBoundary(margin) ? dX : getX() - event.getRawX();
				break;

			case MotionEvent.ACTION_MOVE:
				animate().x(margin).setDuration(0).start();
				break;

			default:
				return false;
		}
		return true;
	}

	private boolean isExceedBoundary(float margin) {
		return margin <= 0 || ((margin + getWidth()) - maxWidth) >= 0;
	}

	public void setMaxWidth(int width) {
		maxWidth = width;
	}

	public void setImageWidth(int imageWidth) {
		this.imageWidth = imageWidth;
	}
}
