package com.litpic.litpicsdkdroid.camerapreview.cameraview.filter;

public interface ThreeParameterFilter extends TwoParameterFilter {

    /**
     * Sets the second parameter.
     * The value should always be between 0 and 1.
     *
     * @param value parameter
     */
    void setParameter3(float value);

    /**
     * Returns the second parameter.
     * The returned value should always be between 0 and 1.
     *
     * @return parameter
     */
    float getParameter3();


}
