package com.litpic.litpicsdkdroid.camerapreview.cameraview.filter;

import androidx.annotation.NonNull;

import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.AutoFixFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.BlackAndWhiteFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.BrightnessFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.ContrastFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.CrossProcessFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.DocumentaryFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.DuotoneFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.FillLightFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.GammaFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.GrainFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.GrayscaleFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.HueFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.InvertColorsFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.LomoishFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.PosterizeFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.SaturationFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.SepiaFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.SharpnessFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.TemperatureFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.TintFilter;
import com.litpic.litpicsdkdroid.camerapreview.cameraview.filters.VignetteFilter;

/**
 * Contains commonly used {@link Filter}s.
 *
 * You can use {@link #newInstance()} to create a new instance and
 * pass it to {@link com.litpic.litpicsdkdroid.camerapreview.cameraview.CameraView#setFilter(Filter)}.
 */
public enum Filters {

    /** @see NoFilter */
    NONE(NoFilter.class),

    /** @see AutoFixFilter */
    AUTO_FIX(AutoFixFilter.class),

    /** @see BlackAndWhiteFilter */
    BLACK_AND_WHITE(BlackAndWhiteFilter.class),

    /** @see BrightnessFilter */
    BRIGHTNESS(BrightnessFilter.class),

    /** @see ContrastFilter */
    CONTRAST(ContrastFilter.class),

    /** @see CrossProcessFilter */
    CROSS_PROCESS(CrossProcessFilter.class),

    /** @see DocumentaryFilter */
    DOCUMENTARY(DocumentaryFilter.class),

    /** @see DuotoneFilter */
    DUOTONE(DuotoneFilter.class),

    /** @see FillLightFilter */
    FILL_LIGHT(FillLightFilter.class),

    /** @see GammaFilter */
    GAMMA(GammaFilter.class),

    /** @see GrainFilter */
    GRAIN(GrainFilter.class),

    /** @see GrayscaleFilter */
    GRAYSCALE(GrayscaleFilter.class),

    /** @see HueFilter */
    HUE(HueFilter.class),

    /** @see InvertColorsFilter */
    INVERT_COLORS(InvertColorsFilter.class),

    /** @see LomoishFilter */
    LOMOISH(LomoishFilter.class),

    /** @see PosterizeFilter */
    POSTERIZE(PosterizeFilter.class),

    /** @see SaturationFilter */
    SATURATION(SaturationFilter.class),

    /** @see SepiaFilter */
    SEPIA(SepiaFilter.class),

    /** @see SharpnessFilter */
    SHARPNESS(SharpnessFilter.class),

    /** @see TemperatureFilter */
    TEMPERATURE(TemperatureFilter.class),

    /** @see TintFilter */
    TINT(TintFilter.class),

    /** @see VignetteFilter */
    VIGNETTE(VignetteFilter.class);

    private Class<? extends Filter> filterClass;

    Filters(@NonNull Class<? extends Filter> filterClass) {
        this.filterClass = filterClass;
    }

    /**
     * Returns a new instance of the given filter.
     * @return a new instance
     */
    @NonNull
    public Filter newInstance() {
        try {
            return filterClass.newInstance();
        } catch (IllegalAccessException e) {
            return new NoFilter();
        } catch (InstantiationException e) {
            return new NoFilter();
        }
    }
}
