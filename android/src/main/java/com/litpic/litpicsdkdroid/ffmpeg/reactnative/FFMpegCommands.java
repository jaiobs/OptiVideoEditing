package com.litpic.litpicsdkdroid.ffmpeg.reactnative;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.litpic.litpicsdkdroid.config.Constants;
import com.litpic.litpicsdkdroid.imageeditor.model.OverlayOnImageData;
import com.litpic.litpicsdkdroid.trimmermodule.TrimmerVideoData;
import com.litpic.litpicsdkdroid.utils.MediaUtils;
import com.litpic.litpicsdkdroid.videoeditor.model.OverlayItemData;

import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 *
 */
public class FFMpegCommands {

    private final Context context;

    public FFMpegCommands(Context context) {
        this.context = context;
    }

    /**
     * @return commands
     */
    public String[] getVersionCommands() {
        StringAppender stringAppender = new StringAppender();
        stringAppender.add(VERSION);
        return stringAppender.getArray();
    }

    /**
     * FFMpeg commands to trim video within specific ranges
     *
     * @param path:         input path
     * @param outputPath:   output path
     * @param startingTime: trim head
     * @param endingTime:   trim tail
     * @return commands
     */
    public String[] getTrimVideoCommands(final String path, final String outputPath, final Double startingTime, final Double endingTime) {
        StringAppender stringAppender = new StringAppender();
        String start = convertSecondsToTime(startingTime);
        String duration = convertSecondsToTime(endingTime - startingTime);
        stringAppender.add(SS);
        stringAppender.add(start);
        stringAppender.add(T);
        stringAppender.add(duration);
        stringAppender.add(ACCURATE_SEEK);
        stringAppender.add(INPUT);
        stringAppender.add(path);
        stringAppender.add(CODEC);
        stringAppender.add(COPY);
        stringAppender.add(AVOID_NEGATIVE_TS);
        stringAppender.add(ONE_1);
        stringAppender.add(outputPath);
        Log.d("@@@", "trimVideoCommands - >" + stringAppender.getString());
        return stringAppender.getArray();
    }

    /**
     * FFMpeg commands to reverse video and replace audio
     *
     * @param videoPath          input video path
     * @param destinationPath    output video saved to this path
     * @param audioPath          input audio path
     * @param audioStartPosition start position of the audio track (in milliseconds)
     * @param audioEndPosition   end position of the audio track (in milliseconds)
     * @return it returns array of strings (ffmpeg commands)
     */
    public String[] getReverseVideoCommands(final String videoPath, String destinationPath, final String audioPath, final int audioStartPosition, final int audioEndPosition) {
        StringAppender stringAppender = new StringAppender();
        if (audioPath != null && !audioPath.isEmpty() && audioStartPosition >= 0) {
            final int duration = MediaUtils.getVideoDuration(context, videoPath);
            final String endTime = (audioEndPosition - audioStartPosition) > duration
                    ? convertMillisecondsToInputFormat(duration)
                    : convertMillisecondsToInputFormat(audioEndPosition - audioStartPosition);
            stringAppender.add(INPUT)
                    .add(videoPath)
                    .add(SS)
                    .add(convertMillisecondsToInputFormat(audioStartPosition))
                    .add(INPUT)
                    .add(audioPath)
                    .add(TO)
                    .add(endTime)
                    .add(FILTER_COMPLEX)
                    .add("[0:v]reverse[r]")
                    .add(MAP)
                    .add("[r]")
                    .add(MAP)
                    .add("1:a")
                    .add(destinationPath);
        } else {
            stringAppender
                    .add(INPUT)
                    .add(videoPath)
                    .add(VF)
                    .add(REVERSE)
                    .add(AF)
                    .add(A_REVERSE)
                    .add(destinationPath);
        }
        Log.d("@@@", "ReverseVideoCommands - >" + stringAppender.getString());
        return stringAppender.getArray();
    }

    /**
     * FFMpeg commands to replace audio with video
     *
     * @param filePath:           input path
     * @param destinationPath:    output path
     * @param audioPath:          input audio path
     * @param audioStartPosition:
     * @param audioEndPosition:
     * @return
     */
    public String[] getNormalVideoCommands(final String filePath, final String destinationPath, String audioPath,
                                           int audioStartPosition, int audioEndPosition) {
        final int duration = MediaUtils.getVideoDuration(context, filePath);
        StringAppender stringAppender = new StringAppender();

        final String endTime = (audioEndPosition - audioStartPosition) > duration
                ? convertMillisecondsToInputFormat(duration)
                : convertMillisecondsToInputFormat(audioEndPosition - audioStartPosition);

        stringAppender
                .add(Y)
                .add(INPUT)
                .add(filePath)
                .add(SS)
                .add(convertMillisecondsToInputFormat(audioStartPosition))
                .add(INPUT)
                .add(audioPath)
                .add(TO)
                .add(endTime)
                .add(MAP)
                .add("0:v")
                .add(MAP)
                .add("1:a")
                .add(CV)
                .add(COPY)
                .add(destinationPath);
        Log.d("@@@", "normalVideoApplyAudio->" + stringAppender.getString());
        return stringAppender.getArray();
    }

    /**
     * FFMpeg commands to speedup the video and add audio to the video
     *
     * @param speed:           video playing speed
     * @param filePath:        input path
     * @param destinationPath: output path
     * @param audioFilePath:   input audio path
     * @param startPosition
     * @param audioEndPosition
     * @return
     */
    public String[] getVideoSpeedWithAudioCommands(final String speed, final String filePath, String destinationPath,
                                                   final String audioFilePath, final int startPosition, final int audioEndPosition) {

        int duration = MediaUtils.getVideoDuration(context, filePath);
        String speedValue = "";
        switch (speed) {
            case Constants.SLOW_1X:
                speedValue = "[0:v]setpts=1.5*PTS[v]";
                duration *= 1.5;
                break;
            case Constants.SLOW_2X:
                speedValue = "[0:v]setpts=2.0*PTS[v]";
                duration *= 2;
                break;
            case Constants.SPEED_1X:
                speedValue = "[0:v]setpts=0.75*PTS[v]";
                duration *= 0.75;
                break;
            case Constants.SPEED_2X:
                speedValue = "[0:v]setpts=0.5*PTS[v]";
                duration *= 0.5;
                break;
            default:
                speedValue = "[0:v]setpts=1.0*PTS[v]";
                break;
        }
        final String endTime = (audioEndPosition - startPosition) > duration
                ? convertMillisecondsToInputFormat(duration)
                : convertMillisecondsToInputFormat(audioEndPosition - startPosition);

        StringAppender stringAppender = new StringAppender();

        stringAppender.add(Y)
                .add(INPUT)
                .add(filePath)
                .add(SS)
                .add(convertMillisecondsToInputFormat(startPosition))
                .add(INPUT)
                .add(audioFilePath)
                .add(TO)
                .add(endTime)
                .add(FILTER_COMPLEX)
                .add(speedValue)
                .add(MAP)
                .add("[v]")
                .add(MAP)
                .add("1:a")
                .add(PRESET)
                .add(ULTRA_FAST)
                .add(destinationPath);
        Log.d("@@@", "videoSpeedWithAudio - >" + stringAppender.getString());
        return stringAppender.getArray();
    }

    public String[] getSpeedVideoCommands(final String speed, final String filePath, final String destinationPath) {
        StringAppender stringAppender = new StringAppender();
        String speedValue = "";
        switch (speed) {
            case Constants.SLOW_1X:
                speedValue = "[0:v]setpts=1.5*PTS[v];[0:a]atempo=0.8[a]";
                break;
            case Constants.SLOW_2X:
                speedValue = "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]";
                break;
            case Constants.SPEED_1X:
                speedValue = "[0:v]setpts=0.75*PTS[v];[0:a]atempo=1.5[a]";
                break;
            case Constants.SPEED_2X:
                speedValue = "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]";
                break;
            default:
                speedValue = "[0:v]setpts=1*PTS[v];[0:a]atempo=1.0[a]";
                break;
        }

        stringAppender
                .add(Y)
                .add(INPUT)
                .add(filePath)
                .add(FILTER_COMPLEX)
                .add(speedValue)
                .add(MAP)
                .add("[v]")
                .add(MAP)
                .add("[a]")
                .add(PRESET)
                .add(ULTRA_FAST)
                .add(destinationPath);
        Log.d("@@@", "video speed ->" + stringAppender.getString());
        return stringAppender.getArray();
    }

    public String[] getConcatMultiVideoCommands(final ReadableArray videos, int width, int height, String outputVideoPath) {
        StringAppender cmdList = new StringAppender();
        StringBuilder sb = new StringBuilder();
        StringBuilder scale = new StringBuilder();

        for (int i = 0; i < videos.size(); i++) {
            cmdList.add(Y);
            cmdList.add(INPUT);
            ReadableMap obj = videos.getMap(i);
            if (obj != null) {
                cmdList.add(obj.getString("uri"));
            }
            scale.append("[").append(i).append(":v]scale=").append(width).append(":")
                    .append(height).append(",setsar=1[v").append(i).append("];");

            sb.append("[v").append(i).append("][").append(i).append(":a]");

            Log.e("@@@", "concat video - >" + i + "th resolution - >" + Objects.requireNonNull(obj).toString());
        }
        sb.append(" concat=n=").append(videos.size()).append(":v=1:a=1 [v] [a]");
        cmdList.add(FILTER_COMPLEX);
        scale.append(sb);
        cmdList.add(scale.toString());

        // ---- add this to avoid frame dublication(prevent error tbr of all video streams
        //don't match
        cmdList.add(V_SYNC);
        cmdList.add(ZERO_0);

        cmdList.add(MAP);
        cmdList.add("[v]");
        cmdList.add(MAP);
        cmdList.add("[a]");
        cmdList.add(PRESET);
        cmdList.add(ULTRA_FAST);
        cmdList.add(outputVideoPath);
        Log.d("@@@", "concatMultipleVideo - >" + cmdList.toString());
        return cmdList.getArray();
    }

    public String[] getConcatMultiVideoWithCRFCommands(final ReadableArray videos, int width, int height, String outputVideoPath) {
        StringAppender cmdList = new StringAppender();
        StringBuilder sb = new StringBuilder();
        StringBuilder scale = new StringBuilder();

        for (int i = 0; i < videos.size(); i++) {
            cmdList.add(Y);
            cmdList.add(INPUT);
            ReadableMap obj = videos.getMap(i);
            if (obj != null) {
                cmdList.add(obj.getString("uri"));
            }
            scale.append("[").append(i).append(":v]scale=").append(width).append(":")
                    .append(height).append(",setsar=1[v").append(i).append("];");

            sb.append("[v").append(i).append("][").append(i).append(":a]");

            Log.d("@@@", "concat video - >" + i + "th resolution - >" + Objects.requireNonNull(obj).toString());
        }
        sb.append(" concat=n=").append(videos.size()).append(":v=1:a=1 [v] [a]");
        cmdList.add(FILTER_COMPLEX);
        scale.append(sb);
        cmdList.add(scale.toString());

        // ---- add this to avoid frame dublication(prevent error tbr of all video streams
        //don't match
        cmdList.add(V_SYNC);
        cmdList.add(ZERO_0);

        cmdList.add(MAP);
        cmdList.add("[v]");
        cmdList.add(MAP);
        cmdList.add("[a]");
        cmdList.add(CV);
        cmdList.add(LIBX_264);
        cmdList.add(PROFILE);
        cmdList.add(PROFILE_MAIN);
        cmdList.add(LEVEL);
        cmdList.add(LEVEL_4);
        cmdList.add(CRF);
        cmdList.add(COMPRESSION_RANGE);
        cmdList.add(PRESET);
        cmdList.add(ULTRA_FAST);
        cmdList.add(outputVideoPath);
        Log.d("@@@", "concatMultipleVideoWithCRF - >" + cmdList.toString());
        return cmdList.getArray();
    }

    public String[] getCRFCompressVideoCommands(final String videoPath, final String outputPath) {
        StringAppender stringAppender = new StringAppender();

        stringAppender.add(Y)
                .add(INPUT)
                .add(videoPath)
                .add(CV)
                .add(LIBX_264)
                .add(CRF)
                .add(COMPRESSION_RANGE)
                .add(CA)
                .add(COPY)
                .add(PRESET)
                .add(SUPER_FAST)
                .add(outputPath);
        Log.d("@@@", "compress video command- >" + stringAppender.getString());
        return stringAppender.getArray();
    }

    public String[] getYuvCompressionCommand() {
        StringAppender stringAppender = new StringAppender();

        Log.d("@@@", "getYuvCompressionCommand - >" + stringAppender.getString());
        return stringAppender.getArray();
    }

    public String[] getTrimAudioCommands(String vFileUrl,
                                         String destinationPath,
                                         Integer startPosition,
                                         Integer endPosition) {
        StringAppender commandList = new StringAppender();
        commandList.add(SS);
        commandList.add(String.valueOf(startPosition / 1000));
        commandList.add(INPUT);
        commandList.add(vFileUrl);
        commandList.add(TO);
        commandList.add(String.valueOf(((endPosition / 1000) - (startPosition / 1000))));
        commandList.add(A_CODEC);
        commandList.add(COPY);
        commandList.add(destinationPath);
        Log.d("@@@", "compress video command - >" + commandList.toString());
        return commandList.getArray();
    }


    public String[] getImageOverlayCommands(String destinationPath,                             // NOSONAR
                                            List<OverlayOnImageData> overlayOnImageDataList,
                                            String imagePath,
                                            int imageWidth,
                                            int imageHeight,
                                            boolean isAnamorphic) {
        final List<String> commandList = new LinkedList<>();
        StringBuilder filterCommand = new StringBuilder();
        boolean isGifAdded = false;
        int time = 5;

        commandList.add(INPUT);
        commandList.add(imagePath);
        for (int i = 0; i < overlayOnImageDataList.size(); i++) {
            if (overlayOnImageDataList.get(i).isGif()) {

                commandList.add(IGNORE_LOOP);
                commandList.add(ZERO_0);

                isGifAdded = true;
                time = Math.max(time, overlayOnImageDataList.get(i).getPlayingTime());
            }
            commandList.add(INPUT);
            commandList.add(overlayOnImageDataList.get(i).getFileUrl());
            if (overlayOnImageDataList.get(i).getRotationX() != 0 && overlayOnImageDataList.get(i).getRotationY() != 0) {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%.2f:%.2f[scale%d];[scale%d]rotate=%.2f*PI/180:c=none:ow=rotw(%.2f*PI/180):oh=roth(%.2f*PI/180)[rotate%d];",
                        (i + 1), overlayOnImageDataList.get(i).getWidth(),
                        overlayOnImageDataList.get(i).getHeight(), (i + 1), (i + 1),
                        overlayOnImageDataList.get(i).getRotation(), overlayOnImageDataList.get(i).getRotationX(),
                        overlayOnImageDataList.get(i).getRotationY(), (i + 1)));
            } else {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%.2f:%.2f[scale%d];[scale%d]rotate=%.2f*PI/180:c=none[rotate%d];",
                        (i + 1), overlayOnImageDataList.get(i).getWidth(),
                        overlayOnImageDataList.get(i).getHeight(), (i + 1), (i + 1),
                        overlayOnImageDataList.get(i).getRotation(), (i + 1)));
            }

            if (i == 0) {
                if (imageWidth % 2 != 0 || imageHeight % 2 != 0 || isAnamorphic) {
                    filterCommand.append(
                            String.format(Locale.getDefault(), "[source][rotate%d]overlay=%.2f:%.2f",
                                    (i + 1), overlayOnImageDataList.get(i).getPositionX(),
                                    overlayOnImageDataList.get(i).getPositionY()));
                } else {
                    filterCommand.append(
                            String.format(Locale.getDefault(), "[0][rotate%d]overlay=%.2f:%.2f",
                                    (i + 1), overlayOnImageDataList.get(i).getPositionX(),
                                    overlayOnImageDataList.get(i).getPositionY()));
                }
            } else {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[over%d][rotate%d]overlay=%.2f:%.2f", i, (i + 1),
                        overlayOnImageDataList.get(i).getPositionX(),
                        overlayOnImageDataList.get(i).getPositionY()));
            }
            if (i == overlayOnImageDataList.size() - 1) {
                filterCommand.append("");
            } else {
                filterCommand.append("[").append(OVER).append((i + 1)).append("];");
            }
        }
        if (isGifAdded) {
            commandList.add(0, LOOP);
            commandList.add(1, ONE_1);
        }
        commandList.add(FILTER_COMPLEX);
        if (isAnamorphic) {
            String finalFilterCommand = "[0]scale=" + imageWidth + ":" + imageHeight
                    + ",setsar=1,setdar=1:1[scalesource];[scalesource]rotate=90*PI/180[source];"
                    + filterCommand.toString();
            //scale=" + imageWidth + ":" + imageHeight + "
            commandList.add(finalFilterCommand);
        } else {
            if (imageWidth % 2 != 0 || imageHeight % 2 != 0) {
                String finalFilterCommand = "[0]scale=ceil(iw/2)*2:ceil(ih/2)*2[source];" + filterCommand.toString();
                commandList.add(finalFilterCommand);
            } else {
                commandList.add(filterCommand.toString());
            }
        }

        if (isGifAdded) {
            commandList.add(T);
            commandList.add(String.valueOf(time));
            commandList.add(CODEC_V);
            commandList.add(LIBX_264);
        }
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);
        Log.d("@@@", "overlay on image command - >>>>" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getSingleVideoTrimmingCommand(String destinationPath,
                                                  TrimmerVideoData trimmerVideoData) {
        final List<String> commandList = new LinkedList<>();
        commandList.add(SS);
        commandList.add(convertMillisecondsToInputFormat(trimmerVideoData.getStartPosition()));
        commandList.add(INPUT);
        commandList.add(trimmerVideoData.getVideoUrl());
        commandList.add(TO);
        commandList.add(convertMillisecondsToInputFormat(trimmerVideoData.getEndPosition()));
        commandList.add("-c");
        commandList.add(COPY);
        commandList.add(destinationPath);
        Log.d("@@@", "single video trimming command ->" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getSingleVideoScaleAndTrimmingCommand(String destinationPath, int finalWidth, int finalHeight,
                                                          TrimmerVideoData trimmerVideoData) {
        final List<String> commandList = new LinkedList<>();
        StringBuilder filterCommands = new StringBuilder();
        String mapAudio;
        commandList.add(Y);
        commandList.add(INPUT);
        commandList.add(trimmerVideoData.getVideoUrl());

        //trim command  with start and end time
        filterCommands.append(String.format(Locale.getDefault(),
                "[0:v]trim=%f:%f,", trimmerVideoData.getStartPosition() / 1000f,
                trimmerVideoData.getEndPosition() / 1000f));

        filterCommands.append(String.format(Locale.getDefault(),
                "scale=%d:%d:force_original_aspect_ratio=1,pad=%d:%d:-1:-1:color=black,setpts=PTS-STARTPTS[v];", // ,setsar=1:1,setdar=1:1 - removed
                finalWidth, finalHeight, finalWidth, finalHeight));

        if (trimmerVideoData.isHasAudioStream()) {
            filterCommands.append(String.format(Locale.getDefault(),
                    "[0:a]atrim=start=%f:end=%f,asetpts=PTS-STARTPTS[a];", trimmerVideoData.getStartPosition() / 1000f,
                    trimmerVideoData.getEndPosition() / 1000f));
            mapAudio = "[a]";
        } else {
            commandList.add(F);
            commandList.add(LAV_FI);
            commandList.add(T);
            commandList.add("0.1");
            commandList.add(INPUT);
            commandList.add(A_NULL_SRC);
            mapAudio = "[1:a]";
        }
        filterCommands.append("[v]").append(mapAudio).append("concat=n=1:v=1:a=1[outv][outa]");

        commandList.add(FILTER_COMPLEX);
        commandList.add(filterCommands.toString());
        commandList.add(MAP);
        commandList.add(OUT_V);
        commandList.add(MAP);
        commandList.add("[outa]");
        commandList.add(KEY_R);
        commandList.add(NTSC_FILM);
        commandList.add(CV);
        commandList.add(LIBX_264);
        commandList.add(PROFILE);
        commandList.add(PROFILE_MAIN);
        commandList.add(LEVEL);
        commandList.add(LEVEL_4);
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);

        Log.d("@@@", "getSingleVideoScaleAndTrimmingCommand ->" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getMultiVideoTrimmingCommand(String destinationPath, int finalWidth, int finalHeight,
                                                 List<TrimmerVideoData> trimmerVideoData) {
        final List<String> commandList = new LinkedList<>();
        int zeroLengthCount = 0;
        boolean isAudioNotThere = false;
        int muteAudioCount = trimmerVideoData.size();
        String sar = (finalWidth > finalHeight) ? SAR_LANDSCAPE : SAR_PORTRAIT;
        List<String> muteAudioList = new LinkedList<>();
        StringBuilder filterCommands = new StringBuilder();
        StringBuilder concatCommand = new StringBuilder();

        for (int i = 0; i < trimmerVideoData.size(); i++) {
            if (trimmerVideoData.get(i).getTotalSelectedTime() > 0) {
                commandList.add(INPUT);
                commandList.add(trimmerVideoData.get(i).getVideoUrl());

                //trim command  with start and end time
                filterCommands.append(String.format(Locale.getDefault(),
                        "[%d:v]trim=%f:%f,", (i), (trimmerVideoData.get(i).getStartPosition() / 1000f),
                        (trimmerVideoData.get(i).getEndPosition() / 1000f)));

                //scale to final resolution without affecting aspect ratio
                filterCommands.append(String.format(Locale.getDefault(),
                        "scale=%d:%d:force_original_aspect_ratio=1,pad=%d:%d:-1:-1:color=black",
                        finalWidth, finalHeight, finalWidth, finalHeight));

                //adjust sar and dar value
                filterCommands.append(String.format(Locale.getDefault(),
                        ",setsar=%s,setdar=1:1,setpts=PTS-STARTPTS[v%d];", sar, (i))); // setsar=1:1,setdar=1:1 - added start pos

                //this condition checks if video has audio or not
                if (trimmerVideoData.get(i).isHasAudioStream()) {
                    //trim audio with start and end position
                    filterCommands.append(String.format(Locale.getDefault()
                            , "[%d:a]atrim=%f:%f,asetpts=PTS-STARTPTS[a%d];"
                            , (i), (trimmerVideoData.get(i).getStartPosition() / 1000f),
                            (trimmerVideoData.get(i).getEndPosition() / 1000f), (i)));

                    //concat command to map video and audio
                    concatCommand.append(String.format(Locale.getDefault(), "[v%d][a%d]",
                            (i), (i)));
                } else {
                    isAudioNotThere = true;
                    ///--------------dead lock situation
                    //inputs to concat command for map video and mute audio
                    concatCommand.append(String.format(Locale.getDefault(), "[v%d][%d:a]",
                            (i), muteAudioCount));
                    muteAudioList.add(F);
                    muteAudioList.add(LAV_FI);
                    muteAudioList.add(T);
                    muteAudioList.add("0.1");
                    muteAudioList.add(INPUT);
                    muteAudioList.add(A_NULL_SRC);
                    muteAudioCount++;
                }

            } else {
                zeroLengthCount++;
            }
        }

        //concat command to merge videos
        concatCommand.append(String.format(Locale.getDefault(), "concat=n=%d:v=1:a=1[outv][outa]"
                , (trimmerVideoData.size() - zeroLengthCount)));

        if (isAudioNotThere) {
            // if audio is not in video add mute audio
            //this command adds mute audio - this audio mapped to video in concat command
            commandList.addAll(muteAudioList);
        }

        commandList.add(FILTER_COMPLEX);
        filterCommands.append(concatCommand);
        commandList.add(filterCommands.toString());
        commandList.add(MAP);
        commandList.add(OUT_V);
        commandList.add(MAP);
        commandList.add("[outa]");
        commandList.add(KEY_R);
        commandList.add(NTSC_FILM);
        commandList.add(CV);
        commandList.add(LIBX_264);
        commandList.add(PROFILE);
        commandList.add(PROFILE_MAIN);
        commandList.add(LEVEL);
        commandList.add(LEVEL_4);
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);

        Log.d("@@@", "multiple video trimming - command -> " + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getVideoOverlayCommands(Uri videoPath, List<OverlayItemData> overlayItemDataList, String destinationPath) { // NOSONAR
        StringBuilder filterCommand = new StringBuilder();

        final List<String> commandList = new LinkedList<>();
        commandList.add(INPUT);
        commandList.add(videoPath.toString());

        for (int i = 0; i < overlayItemDataList.size(); i++) {
            if (overlayItemDataList.get(i).isGif()) {
                commandList.add(IGNORE_LOOP);
                commandList.add(ZERO_0);
            }
            commandList.add(INPUT);
            commandList.add(overlayItemDataList.get(i).getFileUrl());

            if (overlayItemDataList.get(i).getRotationX() != 0 && overlayItemDataList.get(i).getRotationY() != 0) {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%f:%f[scale%d];[scale%d]rotate=%f*PI/180:c=none:ow=rotw(%f*PI/180):oh=roth(%f*PI/180)[rotate%d];",
                        (i + 1), overlayItemDataList.get(i).getWidth(),
                        overlayItemDataList.get(i).getHeight(), (i + 1), (i + 1),
                        overlayItemDataList.get(i).getRotation(), overlayItemDataList.get(i).getRotationX(),
                        overlayItemDataList.get(i).getRotationY(), (i + 1)));
            } else {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%f:%f[scale%d];[scale%d]rotate=%f*PI/180:c=none[rotate%d];",
                        (i + 1), overlayItemDataList.get(i).getWidth(),
                        overlayItemDataList.get(i).getHeight(), (i + 1), (i + 1),
                        overlayItemDataList.get(i).getRotation(), (i + 1)));
            }

            if (i == 0) {
                filterCommand.append(
                        String.format(Locale.getDefault(), "[0][rotate%d]overlay=%f:%f",
                                (i + 1), overlayItemDataList.get(i).getPositionX(),
                                overlayItemDataList.get(i).getPositionY()));
            } else {
                filterCommand.append(
                        String.format(Locale.getDefault(), "[over%d][rotate%d]overlay=%f:%f", i,
                                (i + 1), overlayItemDataList.get(i).getPositionX(),
                                overlayItemDataList.get(i).getPositionY()));
            }

            if (i == overlayItemDataList.size() - 1) {
                if (overlayItemDataList.get(i).isGif()) {
                    filterCommand.append(":shortest=1 ");
                } else {
                    filterCommand.append(" ");
                }
            } else {
                if (overlayItemDataList.get(i).isGif()) {
                    filterCommand.append(":shortest=1[over").append((i + 1)).append("];");
                } else {
                    filterCommand.append("[over").append((i + 1)).append("];");
                }
            }
        }
        commandList.add(FILTER_COMPLEX);
        commandList.add(filterCommand.toString());
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);

        Log.d("@@@", "overlay on video command -->>>" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getVideoRegionSpeedCommands(String videoPath,           // NOSONAR
                                                float duration,
                                                int startTime,
                                                int endTime,
                                                String speed,
                                                String tempo,
                                                String destinationPath,
                                                boolean isHasAudio) {

        int durationInSeconds = (int) (duration / 1000);
        List<String> commandList = new LinkedList<>();
        commandList.add(Y);
        commandList.add(INPUT);
        commandList.add(videoPath);
        commandList.add(FILTER_COMPLEX);

        if (startTime == 0 && endTime == durationInSeconds) {
            if (isHasAudio) {
                commandList.add(String.format(Locale.getDefault()
                        , "[0:v]setpts=%s*PTS[v];[0:a]atempo=%s[a]"
                        , speed, tempo));
                commandList.add(MAP);
                commandList.add("[v]");
                commandList.add(MAP);
                commandList.add("[a]");
            } else {
                commandList.add(String.format(Locale.getDefault()
                        , "[0:v]setpts=%s*PTS", speed));
            }
        } else {

            String filterCmdForVideo = "";
            String filterCmdForAudio = "";
            String concatCommand = "";
            int count = 0;
            if (isHasAudio) {
                if (startTime > 0) {
                    filterCmdForVideo = "[0:v]trim=0:" + startTime + ",setpts=PTS-STARTPTS[v1];";
                    filterCmdForAudio = "[0:a]atrim=0:" + startTime + ",asetpts=PTS-STARTPTS[a1];";
                    concatCommand += "[v1][a1]";
                    count++;
                }
                filterCmdForVideo += "[0:v]" + TRIM + "=" + startTime + ":" + endTime + ",setpts=" + speed + "*(PTS-STARTPTS)[speedv];";
                filterCmdForAudio += "[0:a]atrim=" + startTime + ":" + endTime + ",asetpts=PTS-STARTPTS,atempo=" + tempo + "[speeda];";
                concatCommand += "[speedv][speeda]";
                count++;

                if (endTime < durationInSeconds) {
                    filterCmdForVideo += "[0:v]" + TRIM + "=" + endTime + ":" + durationInSeconds + ",setpts=PTS-STARTPTS[v3];";
                    filterCmdForAudio += "[0:a]atrim=" + endTime + ":" + durationInSeconds + ",asetpts=PTS-STARTPTS[a3];";
                    concatCommand += "[v3][a3]";
                    count++;
                }
                concatCommand += CONCAT + "=n=" + count + ":v=1:a=1";
                filterCmdForVideo += filterCmdForAudio + concatCommand;
                commandList.add(filterCmdForVideo);
            } else {
                if (startTime > 0) {
                    filterCmdForVideo = "[0:v]trim=0:" + startTime + ",setpts=PTS-STARTPTS[v1];";
                    concatCommand += "[v1]";
                    count++;
                }
                filterCmdForVideo += "[0:v]trim=" + startTime + ":" + endTime + ",setpts=" + speed + "*PTS[speedv];";
                concatCommand += "[speedv]";
                count++;

                if (endTime < durationInSeconds) {
                    filterCmdForVideo += "[0:v]trim=" + endTime + ":" + durationInSeconds + ",setpts=PTS-STARTPTS[v3];";
                    concatCommand += "[v3]";
                    count++;
                }
                concatCommand += "concat=n=" + count + ":v=1:a=0";
                filterCmdForVideo += concatCommand;
                commandList.add(filterCmdForVideo);
            }
        }
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);
        Log.d("@@@", "apply speed to video - ffmepg command ->>>" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getVideoScaleAndBitRateCommand(String videoPath, int finalWidth, int finalHeight, String destinationPath) {
        List<String> commandList = new LinkedList<>();
        StringBuilder filterCommands = new StringBuilder();
        commandList.add(Y);
        commandList.add(INPUT);
        commandList.add(videoPath);
        commandList.add(FILTER_COMPLEX);
        filterCommands.append(String.format(Locale.getDefault(),
                "scale=%d:%d:force_original_aspect_ratio=1,pad=%d:%d:-1:-1:color=black", //,setsar=1:1,setdar=1:1 -removed
                finalWidth, finalHeight, finalWidth, finalHeight));

        commandList.add(filterCommands.toString());
        commandList.add(CV);
        commandList.add(LIBX_264);
        commandList.add(PROFILE);
        commandList.add(PROFILE_MAIN);
        commandList.add(LEVEL);
        commandList.add(LEVEL_4);
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);
        Log.d("@@@", "getVideoScaleAndBitRateCommand - ffmepg command ->>>" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }


    public String[] getAddMovAtomToVideoCommand(String videoPath, String destinationPath) {
        List<String> commandList = new LinkedList<>();
        commandList.add(INPUT);
        commandList.add(videoPath);
        commandList.add(V_CODEC);
        commandList.add(COPY);
        commandList.add(A_CODEC);
        commandList.add(COPY);
        commandList.add(MOV_FLAG);
        commandList.add(FAST_START);
        commandList.add(destinationPath);
        Log.d("@@@", "add mov flag command" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getApplyMusicToVideo(String videoPath, String audioUrl, String destinationPath) {
        List<String> commandList = new LinkedList<>();
        commandList.add(INPUT);
        commandList.add(videoPath);
        commandList.add(FILTER_COMPLEX);
        commandList.add(String.format(Locale.getDefault(),
                "amovie=%s:loop=0,asetpts=N/SR/TB[aud]", audioUrl));
        commandList.add(MAP);
        commandList.add("0:v");
        commandList.add(MAP);
        commandList.add("[aud]"); // commandList.add("[a]"); use this command for mix audios
        commandList.add(CV);
        commandList.add(COPY);
        commandList.add(CA);
        commandList.add(AAC);
        commandList.add(BA);
        commandList.add(B_256K);
        commandList.add(SHORTEST);
        commandList.add(destinationPath);
        Log.d("@@@", "audio apply to video ffmpeg command-> " + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getApplyMusicToImage(String imagePath, String audioPath, String destinationPath) {
        List<String> commandList = new LinkedList<>();
        commandList.add(LOOP);
        commandList.add(ONE_1);
        commandList.add(Y);
        commandList.add(INPUT);
        commandList.add(imagePath);
        commandList.add(INPUT);
        commandList.add(audioPath);
        commandList.add(VF);
        if (MediaUtils.isAnamorphic(imagePath)) {
            commandList.add("pad=ceil(iw/2)*2:ceil(ih/2)*2,transpose=1");
        } else {
            commandList.add("pad=ceil(iw/2)*2:ceil(ih/2)*2");
        }
        commandList.add(A_CODEC);
        commandList.add(COPY);
        commandList.add(CODEC_V);
        commandList.add(LIBX_264);
        commandList.add(PROFILE);
        commandList.add(PROFILE_MAIN);
        commandList.add(LEVEL);
        commandList.add(LEVEL_4);
        commandList.add(SHORTEST);
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);
        Log.d("@@@", "applyMusicToImage - >" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getApplyMusicToImageAacAndX264(String imagePath, String audioPath, String destinationPath) {
        List<String> commandList = new LinkedList<>();
        commandList.add(LOOP);
        commandList.add(ONE_1);
        commandList.add(Y);
        commandList.add(INPUT);
        commandList.add(imagePath);
        commandList.add(INPUT);
        commandList.add(audioPath);
        commandList.add(CV);
        commandList.add(LIBX_264);
        commandList.add(TUNE);
        commandList.add(STILL_IMAGE);
        commandList.add(CA);
        commandList.add(AAC);
        commandList.add(BA);
        commandList.add(B_192K);
        commandList.add(PIXEL_FORMAT);
        commandList.add(YUV_FORMAT);
        commandList.add(SHORTEST);
        commandList.add(VF);
        if (MediaUtils.isAnamorphic(imagePath)) {
            commandList.add("pad=ceil(iw/2)*2:ceil(ih/2)*2,transpose=1");
        } else {
            commandList.add("pad=ceil(iw/2)*2:ceil(ih/2)*2");
        }
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);
        Log.d("@@@", "applyMusicToImage - >" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getImageOverlayWithMusicCommands(String destinationPath,                            // NOSONAR
                                                     List<OverlayOnImageData> overlayOnImageDataList,
                                                     String imagePath,
                                                     String audioPath,
                                                     int imageWidth,
                                                     int imageHeight,
                                                     boolean isAnamorphic) {
        final List<String> commandList = new LinkedList<>();
        StringBuilder filterCommand = new StringBuilder();
        boolean isGifAdded = false;

        commandList.add(INPUT);
        commandList.add(imagePath);
        commandList.add(INPUT);
        commandList.add(audioPath);
        for (int i = 0; i < overlayOnImageDataList.size(); i++) {
            if (overlayOnImageDataList.get(i).isGif()) {

                commandList.add(IGNORE_LOOP);
                commandList.add(ZERO_0);

                isGifAdded = true;
            }
            commandList.add(INPUT);
            commandList.add(overlayOnImageDataList.get(i).getFileUrl());
            if (overlayOnImageDataList.get(i).getRotationX() != 0 && overlayOnImageDataList.get(i).getRotationY() != 0) {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%.2f:%.2f[scale%d];[scale%d]rotate=%.2f*PI/180:c=none:ow=rotw(%.2f*PI/180):oh=roth(%.2f*PI/180)[rotate%d];",
                        (i + 2), overlayOnImageDataList.get(i).getWidth(),
                        overlayOnImageDataList.get(i).getHeight(), (i + 2), (i + 2),
                        overlayOnImageDataList.get(i).getRotation(), overlayOnImageDataList.get(i).getRotationX(),
                        overlayOnImageDataList.get(i).getRotationY(), (i + 2)));
            } else {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%.2f:%.2f[scale%d];[scale%d]rotate=%.2f*PI/180:c=none[rotate%d];",
                        (i + 2), overlayOnImageDataList.get(i).getWidth(),
                        overlayOnImageDataList.get(i).getHeight(), (i + 2), (i + 2),
                        overlayOnImageDataList.get(i).getRotation(), (i + 2)));
            }

            if (i == 0) {
                if (imageWidth % 2 != 0 || imageHeight % 2 != 0 || isAnamorphic) {
                    filterCommand.append(
                            String.format(Locale.getDefault(), "[source][rotate%d]overlay=%.2f:%.2f",
                                    (i + 2), overlayOnImageDataList.get(i).getPositionX(),
                                    overlayOnImageDataList.get(i).getPositionY()));
                } else {
                    filterCommand.append(
                            String.format(Locale.getDefault(), "[0][rotate%d]overlay=%.2f:%.2f",
                                    (i + 2), overlayOnImageDataList.get(i).getPositionX(),
                                    overlayOnImageDataList.get(i).getPositionY()));
                }
            } else {
                filterCommand.append(String.format(Locale.getDefault(),
                        "[over%d][rotate%d]overlay=%.2f:%.2f", i + 1, (i + 2),
                        overlayOnImageDataList.get(i).getPositionX(),
                        overlayOnImageDataList.get(i).getPositionY()));
            }
            if (i == overlayOnImageDataList.size() - 1) {
                filterCommand.append("");
            } else {
                filterCommand.append("[over").append((i + 2)).append("];");
            }
        }
        if (isGifAdded) {
            commandList.add(0, LOOP);
            commandList.add(1, ONE_1);
        }
        commandList.add(FILTER_COMPLEX);
        if (isAnamorphic) {
            String finalFilterCommand = "[0]scale=" + imageWidth + ":" + imageHeight
                    + ",setsar=1,setdar=1:1[scalesource];[scalesource]rotate=90*PI/180[source];"
                    + filterCommand.toString();
            commandList.add(finalFilterCommand);
        } else {
            if (imageWidth % 2 != 0 || imageHeight % 2 != 0) {
                String finalFilterCommand = "[0]scale=ceil(iw/2)*2:ceil(ih/2)*2[source];" + filterCommand.toString();
                commandList.add(finalFilterCommand);
            } else {
                commandList.add(filterCommand.toString());
            }
        }

        if (isGifAdded) {
            commandList.add(SHORTEST);
        }
        commandList.add(A_CODEC);
        commandList.add(COPY);
        commandList.add(CODEC_V);
        commandList.add(LIBX_264);
        commandList.add(PROFILE);
        commandList.add(PROFILE_MAIN);
        commandList.add(LEVEL);
        commandList.add(LEVEL_4);
        commandList.add(PRESET);
        commandList.add(ULTRA_FAST);
        commandList.add(destinationPath);
        Log.d("@@@", "overlay on image with music command - >>>>" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getConvertImagesToVideoCommand(final ReadableArray images, final int width, final int height, String destinationPath) {
        List<String> commandList = new LinkedList<>();
        StringBuilder filterCommands = new StringBuilder();
        StringBuilder concatCommands = new StringBuilder();
        float time = MIN_TIME_FOR_IMAGE;
        if (images.size() > Constants.FIXED_SELECTED_PHOTO_COUNT) {
            time = Constants.FIXED_SELECTED_PHOTO_COUNT / (images.size() * 1f);
        }

        //add empty audio
        for (int i = 0; i < images.size(); i++) {
            commandList.add(LOOP);
            commandList.add(ONE_1);
            commandList.add(T);
            commandList.add(String.valueOf(time));
            commandList.add(INPUT);
            ReadableMap obj = images.getMap(i);
            String imagePath = Objects.requireNonNull(obj).getString(Constants.IMAGE_PATH);
            commandList.add(imagePath);
            if (MediaUtils.isAnamorphic(imagePath)) {
                filterCommands.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%d:%d:force_original_aspect_ratio=1,pad=%d:%d:-1:-1:color=black,setsar=1[scalesource];[scalesource]rotate=90*PI/180[v%d];",
                        i, width, height, width, height, i));
            } else {
                filterCommands.append(String.format(Locale.getDefault(),
                        "[%d:v]scale=%d:%d:force_original_aspect_ratio=1,pad=%d:%d:-1:-1:color=black,setsar=1[v%d];",
                        i, width, height, width, height, i));
            }
            concatCommands.append("[v").append(i).append("]");
        }
        commandList.add(FILTER_COMPLEX);
        concatCommands.append("concat=n=").append(images.size()).append(":v=1:a=0,format=yuv420p[outv]");
        filterCommands.append(concatCommands);
        commandList.add(filterCommands.toString());

        commandList.add(MAP);
        commandList.add(OUT_V);
        commandList.add(CV);
        commandList.add(LIBX_264);
        commandList.add(PROFILE);
        commandList.add(PROFILE_MAIN);
        commandList.add(LEVEL);
        commandList.add(LEVEL_4);
        commandList.add(destinationPath);
        Log.d("@@@", "getConvertImagesToVideoCommand - >" + commandList.toString());
        return commandList.toArray(new String[commandList.size()]);
    }

    public String[] getCodecAndProfileUpdateCommand(String inputUrl, String outputUrl) {
        StringAppender cmdList = new StringAppender();
        cmdList.add(Y);
        cmdList.add(INPUT);
        cmdList.add(inputUrl);
        cmdList.add(CV);
        cmdList.add(LIBX_264);
        cmdList.add(PROFILE);
        cmdList.add(PROFILE_MAIN);
        cmdList.add(LEVEL);
        cmdList.add(LEVEL_4);
        cmdList.add(CRF);
        cmdList.add(COMPRESSION_RANGE);
        cmdList.add(PRESET);
        cmdList.add(ULTRA_FAST);
        cmdList.add(outputUrl);
        return cmdList.getArray();
    }

    private String convertSecondsToTime(Double seconds) {
        String timeStr = null;
        int hour = 0;
        int minute = 0;
        int second = 0;
        if (seconds <= 0) {
            return "00:00";
        } else {
            minute = (int) (seconds / 60);
            if (minute < 60) {
                second = (int) (seconds % 60);
                timeStr = "00:" + unitFormat(minute) + ":" + unitFormat(second);
            } else {
                hour = minute / 60;
                if (hour > 99) {
                    return "99:59:59";
                }
                minute = minute % 60;
                second = (int) (seconds - hour * 3600 - minute * 60);
                timeStr = unitFormat(hour) + ":" + unitFormat(minute) + ":" + unitFormat(second);
            }
        }
        return timeStr;
    }

    private String unitFormat(int i) {
        String retStr = null;
        retStr = (i >= 0 && i < 10) ? "0" + i : "" + i;
        return retStr;
    }

    private String convertMillisecondsToInputFormat(int milliseconds) {
        int seconds = milliseconds / 1000;
        String strSeconds = seconds < 10 ? "0" + seconds : String.valueOf(seconds);
        return "00:00:" + strSeconds + "." + (milliseconds % 1000);
    }

    private static final String Y = "-y";
    private static final String INPUT = "-i";
    private static final String SS = "-ss";
    private static final String TO = "-to";
    private static final String T = "-t";
    private static final String PRESET = "-preset";
    private static final String ULTRA_FAST = "ultrafast";
    private static final String SUPER_FAST = "superfast";
    private static final String MAP = "-map";
    private static final String FILTER_COMPLEX = "-filter_complex";
    private static final String IGNORE_LOOP = "-ignore_loop";
    private static final String LOOP = "-loop";
    private static final String COPY = "copy";
    private static final String LIBX_264 = "libx264";
    private static final String ACCURATE_SEEK = "-accurate_seek";
    private static final String CODEC = "-codec";
    private static final String CODEC_V = "-codec:v";
    private static final String A_CODEC = "-acodec";
    private static final String V_CODEC = "-vcodec";
    private static final String REVERSE = "reverse";
    private static final String A_REVERSE = "areverse";
    private static final String VF = "-vf";
    private static final String AF = "-af";
    private static final String V_SYNC = "-vsync";
    private static final String CRF = "-crf";
    private static final String NTSC_FILM = "ntsc-film";
    private static final String COMPRESSION_RANGE = "23";
    private static final String VERSION = "-version";
    private static final String AVOID_NEGATIVE_TS = "-avoid_negative_ts";
    private static final String SAR_PORTRAIT = "9:16";
    private static final String SAR_LANDSCAPE = "16:9";
    private static final String MOV_FLAG = "-movflags";
    private static final String FAST_START = "faststart ";
    private static final String SHORTEST = "-shortest";
    private static final String PIXEL_FORMAT = "-pix_fmt";
    private static final String YUV_FORMAT = "yuv420p";
    private static final float MIN_TIME_FOR_IMAGE = 3.0f;
    private static final String PROFILE = "-profile:v";
    private static final String PROFILE_MAIN = "main";
    private static final String LEVEL = "-level:v";
    private static final String LEVEL_4 = "4.0";
    private static final String CV = "-c:v";
    private static final String B_192K = "192k";
    private static final String BA = "-b:a";
    private static final String AAC = "aac";
    private static final String CA = "-c:a";
    private static final String STILL_IMAGE = "stillimage";
    private static final String TUNE = "-tune";
    private static final String ZERO_0 = "0";
    private static final String ONE_1 = "1";
    private static final String B_256K = "256k";
    private static final String KEY_R = "-r";
    private static final String OUT_V = "[outv]";
    private static final String A_NULL_SRC = "anullsrc";
    private static final String LAV_FI = "lavfi";
    private static final String F = "-f";
    private static final String OVER = "over";
    private static final String CONCAT = "concat";
    private static final String TRIM = "trim";
    private static final String S = "-s";
    private static final String X = "x";
}
