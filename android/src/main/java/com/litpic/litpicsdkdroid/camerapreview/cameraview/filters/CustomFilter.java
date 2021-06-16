package com.litpic.litpicsdkdroid.camerapreview.cameraview.filters;

import android.opengl.GLES20;

import androidx.annotation.NonNull;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.BaseFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.TwoParameterFilter;
import com.otaliastudios.opengl.core.Egloo;

public class CustomFilter extends BaseFilter implements TwoParameterFilter {

    private final static String FRAGMENT_SHADER = "#extension GL_OES_EGL_image_external : require\n"
            + "precision mediump float;\n"
            + "uniform samplerExternalOES sTexture;\n"
            + "uniform float contrast;\n"
            + "uniform float brightness;\n"
            + "varying vec2 " + DEFAULT_FRAGMENT_TEXTURE_COORDINATE_NAME + ";\n"
            + "void main() {\n"
            + "  vec4 color = texture2D(sTexture, " + DEFAULT_FRAGMENT_TEXTURE_COORDINATE_NAME + ");\n"
            + "  color -= 0.5;\n"
            + "  color *= contrast;\n"
            + "  color += 0.5;\n"
            + "  gl_FragColor = brightness * color;\n"
            + "}\n";

    private float brightness = 2.0f; // 1.0F...2.0F
    private int brightnessLocation = -1;

    private float contrast = 2F;
    private int contrastLocation = -1;

    public CustomFilter() {
    }

    /**
     * Sets the brightness adjustment.
     * 1.0: normal brightness.
     * 2.0: high brightness.
     *
     * @param brightness brightness.
     */
    @SuppressWarnings({"WeakerAccess", "unused"})
    public void setBrightness(float brightness) {
        if (brightness < 1.0f) brightness = 1.0f;
        if (brightness > 2.0f) brightness = 2.0f;
        this.brightness = brightness;
    }

    /**
     * Sets the current contrast adjustment.
     * 1.0: no adjustment
     * 2.0: increased contrast
     *
     * @param contrast contrast
     */
    @SuppressWarnings("WeakerAccess")
    public void setContrast(float contrast) {
        if (contrast < 1.0f) contrast = 1.0f;
        if (contrast > 2.0f) contrast = 2.0f;
        this.contrast = contrast;
    }

    /**
     * Returns the current brightness.
     *
     * @return brightness
     * @see #setBrightness(float)
     */
    @SuppressWarnings({"unused", "WeakerAccess"})
    public float getBrightness() {
        return brightness;
    }

    /**
     * Returns the current contrast.
     *
     * @return contrast
     * @see #setContrast(float)
     */
    @SuppressWarnings({"unused", "WeakerAccess"})
    public float getContrast() {
        return contrast;
    }

    @Override
    public void setParameter1(float value) {
        // parameter is 0...1, brightness is 1...2.
        setContrast(value + 1);
    }

    @Override
    public float getParameter1() {
        // parameter is 0...1, brightness is 1...2.
        return getContrast() - 1F;
    }

    @Override
    public void setParameter2(float value) {
        // parameter is 0...1, brightness is 1...2.
        setBrightness(value + 1);
    }

    @Override
    public float getParameter2() {
        // parameter is 0...1, brightness is 1...2.
        return getBrightness() - 1F;
    }

    @NonNull
    @Override
    public String getFragmentShader() {
        return FRAGMENT_SHADER;
    }

    @Override
    public void onCreate(int programHandle) {
        super.onCreate(programHandle);
        contrastLocation = GLES20.glGetUniformLocation(programHandle, "contrast");
        Egloo.checkGlProgramLocation(contrastLocation, "contrast");
        brightnessLocation = GLES20.glGetUniformLocation(programHandle, "brightness");
        Egloo.checkGlProgramLocation(brightnessLocation, "brightness");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        brightnessLocation = -1;
        contrastLocation = -1;
    }

    @Override
    protected void onPreDraw(long timestampUs, @NonNull float[] transformMatrix) {
        super.onPreDraw(timestampUs, transformMatrix);

        GLES20.glUniform1f(contrastLocation, contrast);
        Egloo.checkGlError("glUniform1f");

        GLES20.glUniform1f(brightnessLocation, brightness);
        Egloo.checkGlError("glUniform1f");
    }
}
