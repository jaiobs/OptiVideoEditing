package com.litpic.litpicsdkdroid.camerapreview.cameraview.filters;

import android.opengl.GLES20;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.BaseFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.OneParameterFilter;
import com.otaliastudios.opengl.core.Egloo;

import java.nio.FloatBuffer;

import androidx.annotation.NonNull;

public class MonochromeFilter extends BaseFilter implements OneParameterFilter {

	public static final String MONOCHROME_FRAGMENT_SHADER =
			"#extension GL_OES_EGL_image_external : require\n" + "precision mediump float;\n" +
					" precision lowp float;\n" + "  \n" + "  varying highp vec2 vTextureCoord;\n" +
					"  \n" + "  uniform samplerExternalOES sTexture;\n" +
					"  uniform float intensity;\n" + "  uniform vec3 filterColor;\n" + "  \n" +
					"  const mediump vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n" +
					"  \n" + "  void main()\n" + "  {\n" +
					" 	//desat, then apply overlay blend\n" +
					" 	lowp vec4 textureColor = texture2D(sTexture, vTextureCoord);\n" +
					" 	float luminance = dot(textureColor.rgb, luminanceWeighting);\n" +
					" 	\n" + " 	lowp vec4 desat = vec4(vec3(luminance), 1.0);\n" + " 	\n" +
					" 	//overlay\n" + " 	lowp vec4 outputColor = vec4(\n" +
					"                                  (desat.r < 0.5 ? (2.0 * desat.r * filterColor.r) : (1.0 - 2.0 * (1.0 - desat.r) * (1.0 - filterColor.r))),\n" +
					"                                  (desat.g < 0.5 ? (2.0 * desat.g * filterColor.g) : (1.0 - 2.0 * (1.0 - desat.g) * (1.0 - filterColor.g))),\n" +
					"                                  (desat.b < 0.5 ? (2.0 * desat.b * filterColor.b) : (1.0 - 2.0 * (1.0 - desat.b) * (1.0 - filterColor.b))),\n" +
					"                                  1.0\n" +
					"                                  );\n" + " 	\n" +
					" 	//which is better, or are they equal?\n" +
					" 	gl_FragColor = vec4( mix(textureColor.rgb, outputColor.rgb, intensity), textureColor.a);\n" +
					"  }";

	@NonNull
	@Override
	public String getFragmentShader() {
		return MONOCHROME_FRAGMENT_SHADER;
	}

	private int intensityLocation;
	private float intensity;
	private int filterColorLocation;
	private float[] color = new float[]{0.6f, 0.45f, 0.3f, 1.0f};

	public MonochromeFilter() {
		this(1.0f);
	}

	public MonochromeFilter(final float intensity) {
		this.intensity = intensity;
	}

	@Override
	public void onCreate(int programHandle) {
		super.onCreate(programHandle);
		intensityLocation = GLES20.glGetUniformLocation(programHandle, "intensity");
		filterColorLocation = GLES20.glGetUniformLocation(programHandle, "filterColor");
		Egloo.checkGlProgramLocation(intensityLocation, "intensity");
		Egloo.checkGlProgramLocation(filterColorLocation, "filterColor");
	}

	@Override
	protected void onPreDraw(long timestampUs, @NonNull float[] transformMatrix) {
		super.onPreDraw(timestampUs, transformMatrix);

		GLES20.glUniform1f(intensityLocation, intensity);
		GLES20.glUniform3fv(filterColorLocation, 1,
				FloatBuffer.wrap(new float[]{color[0], color[1], color[2]}));

		Egloo.checkGlError("glUniform1f");
		Egloo.checkGlError("glUniform3fv");
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
	}

	@Override
	public void setParameter1(float value) {
		intensity = value;
	}

	@Override
	public float getParameter1() {
		return intensity;
	}
}
