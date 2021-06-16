package com.litpic.litpicsdkdroid.camerapreview.cameraview.filters;

import android.graphics.PointF;
import android.opengl.GLES20;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.BaseFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.OneParameterFilter;
import com.otaliastudios.opengl.core.Egloo;

import androidx.annotation.NonNull;

public class BlurFilter extends BaseFilter {

	public static final String ZOOM_BLUR_FRAGMENT_SHADER =
			"#extension GL_OES_EGL_image_external : require\n"
			+ "precision mediump float;\n"+
			"varying highp vec2 vTextureCoord;\n" +
			"\n" +
			"uniform samplerExternalOES sTexture;\n" +
			"\n" +
			"uniform highp vec2 blurCenter;\n" +
			"uniform highp float blurSize;\n" +
			"\n" +
			"void main()\n" +
			"{\n" +
			"    // TODO: Do a more intelligent scaling based on resolution here\n" +
			"    highp vec2 samplingOffset = 1.0/100.0 * (blurCenter - vTextureCoord) * blurSize;\n" +
			"    \n" +
			"    lowp vec4 fragmentColor = texture2D(sTexture, vTextureCoord) * 0.18;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord + samplingOffset) * 0.15;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord + (2.0 * samplingOffset)) *  0.12;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord + (3.0 * samplingOffset)) * 0.09;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord + (4.0 * samplingOffset)) * 0.05;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord - samplingOffset) * 0.15;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord - (2.0 * samplingOffset)) *  0.12;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord - (3.0 * samplingOffset)) * 0.09;\n" +
			"    fragmentColor += texture2D(sTexture, vTextureCoord - (4.0 * samplingOffset)) * 0.05;\n" +
			"    \n" +
			"    gl_FragColor = fragmentColor;\n" +
			"}\n";


	private PointF blurCenter;
	private int blurCenterLocation;
	private float blurSize;
	private int blurSizeLocation;

	public BlurFilter() {
		this(new PointF(0.5f, 0.5f), 1.0f);
	}

	public BlurFilter(PointF blurCenter, float blurSize) {
		this.blurCenter = blurCenter;
		this.blurSize = blurSize;
	}

	@NonNull
	@Override
	public String getFragmentShader() {
		return ZOOM_BLUR_FRAGMENT_SHADER;
	}

	@Override
	public void onCreate(int programHandle) {
		super.onCreate(programHandle);
		blurCenterLocation = GLES20.glGetUniformLocation(programHandle, "blurCenter");
		blurSizeLocation = GLES20.glGetUniformLocation(programHandle, "blurSize");

		Egloo.checkGlProgramLocation(blurCenterLocation, "gammblurCentera");
		Egloo.checkGlProgramLocation(blurSizeLocation, "blurSize");
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
	}

	public float[] getBlurCenterValue(PointF blurCenter) {
		float[] vec2 = new float[2];
		vec2[0] = blurCenter.x;
		vec2[1] = blurCenter.y;
		return vec2;
	}

	@Override
	protected void onPreDraw(long timestampUs, @NonNull float[] transformMatrix) {
		super.onPreDraw(timestampUs, transformMatrix);
		GLES20.glUniform2fv(blurCenterLocation, 1, getBlurCenterValue(blurCenter), 0);
		GLES20.glUniform1f(blurSizeLocation, blurSize);
		Egloo.checkGlError("glUniform2fv");
		Egloo.checkGlError("glUniform1f");
	}

	@Override
	protected void onDraw(long timestampUs) {
		super.onDraw(timestampUs);
	}
}
