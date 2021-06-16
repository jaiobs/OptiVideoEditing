package com.litpic.litpicsdkdroid.camerapreview.cameraview.filters;

import android.opengl.GLES20;

import androidx.annotation.NonNull;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.BaseFilter;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filter.ThreeParameterFilter;
import com.otaliastudios.opengl.core.Egloo;

public class CustomFilterTwo extends BaseFilter implements ThreeParameterFilter {

    private final static String FRAGMENT_SHADER = "#extension GL_OES_EGL_image_external : require\n"
            + "precision mediump float;\n"
            + "uniform samplerExternalOES sTexture;\n"
            + "uniform float contrast;\n"
            + "uniform float brightness;\n"
            + "uniform float scale;\n"
            + "uniform vec3 exponents;\n"
            + "float shift;\n"
            + "vec3 weights;\n"
            + "varying vec2 " + DEFAULT_FRAGMENT_TEXTURE_COORDINATE_NAME + ";\n"
            + "void main() {\n"
            + "  weights[0] = " + 2f / 8f + ";\n"
            + "  weights[1] = " + 5f / 8f + ";\n"
            + "  weights[2] = " + 1f / 8f + ";\n"
            + "  shift = " + 1.0f / 255.0f + ";\n"
            + "  vec4 oldcolor = texture2D(sTexture, " + DEFAULT_FRAGMENT_TEXTURE_COORDINATE_NAME
            + ");\n"
            + "  float kv = dot(oldcolor.rgb, weights) + shift;\n"
            + "  vec3 new_color = scale * oldcolor.rgb + (1.0 - scale) * kv;\n"
            + "  gl_FragColor = vec4(new_color, oldcolor.a);\n"
            + "  vec4 color = texture2D(sTexture, " + DEFAULT_FRAGMENT_TEXTURE_COORDINATE_NAME + ");\n"
            + "  color -= 0.5;\n"
            + "  color *= contrast;\n"
            + "  color += 0.5;\n"
            + "  float de = dot(color.rgb, weights);\n"
            + "  float inv_de = 1.0 / de;\n"
            + "  vec3 verynew_color = de * pow(color.rgb * inv_de, exponents);\n"
            + "  float max_color = max(max(max(verynew_color.r, verynew_color.g), "
            + "verynew_color.b), 1.0);\n"
            + "  gl_FragColor = brightness * color;\n"
            + "}\n";

    private float brightness = 2.0f; // 1.0F...2.0F
    private int brightnessLocation = -1;

    private float contrast = 2F;
    private int contrastLocation = -1;

    private float scale = 1F; // -1...1
    private int scaleLocation = -1;
    private int exponentsLocation = -1;


    public CustomFilterTwo() {
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
        //FRAGMENT_SHADER.replace("brightness",String.valueOf(brightness));
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

    /**
     * Sets the saturation correction value:
     * -1.0: fully desaturated, grayscale.
     * 0.0: no change.
     * +1.0: fully saturated.
     *
     * @param value new value
     */
    @SuppressWarnings("WeakerAccess")
    public void setSaturation(float value) {
        if (value < -1F) value = -1F;
        if (value > 1F) value = 1F;
        scale = value;
    }

    /**
     * Returns the current saturation.
     *
     * @return saturation
     * @see #setSaturation(float)
     */
    @SuppressWarnings("WeakerAccess")
    public float getSaturation() {
        return scale;
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

    @Override
    public void setParameter3(float value) {
        setSaturation(2F * value - 1F);
    }

    @Override
    public float getParameter3() {
        return (getSaturation() + 1F) / 2F;
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

        scaleLocation = GLES20.glGetUniformLocation(programHandle, "scale");
        Egloo.checkGlProgramLocation(scaleLocation, "scale");
        exponentsLocation = GLES20.glGetUniformLocation(programHandle, "exponents");
        Egloo.checkGlProgramLocation(exponentsLocation, "exponents");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        brightnessLocation = -1;
        contrastLocation = -1;

        scaleLocation = -1;
        exponentsLocation = -1;
    }

    @Override
    protected void onPreDraw(long timestampUs, @NonNull float[] transformMatrix) {
        super.onPreDraw(timestampUs, transformMatrix);

        GLES20.glUniform1f(contrastLocation, contrast);
        Egloo.checkGlError("glUniform1f");

        GLES20.glUniform1f(brightnessLocation, brightness);
        Egloo.checkGlError("glUniform1f");

        if (scale > 0.0f) {
            GLES20.glUniform1f(scaleLocation, 0F);
            Egloo.checkGlError("glUniform1f");
            GLES20.glUniform3f(exponentsLocation,
                    (0.9f * scale) + 1.0f,
                    (2.1f * scale) + 1.0f,
                    (2.7f * scale) + 1.0f
            );
            Egloo.checkGlError("glUniform3f");
        } else {
            GLES20.glUniform1f(scaleLocation, 1.0F + scale);
            Egloo.checkGlError("glUniform1f");
            GLES20.glUniform3f(exponentsLocation, 0F, 0F, 0F);
            Egloo.checkGlError("glUniform3f");
        }
    }
}
