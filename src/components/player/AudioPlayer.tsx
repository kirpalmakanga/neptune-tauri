import { createAudio } from '@solid-primitives/audio';
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    onMount
} from 'solid-js';
import { throttle } from '../../utils/helpers';

const ProgressBar: Component<{ percentage: number }> = (props) => (
    <span class="absolute inset-0 overflow-hidden">
        <span
            class="absolute inset-0 bg-primary-400"
            style={{
                transform: `translateX(${props.percentage - 100}%)`
            }}
        ></span>
    </span>
);

interface SeekBarProps {
    onSeek: (percent: number) => void;
}

const SeekBar: Component<SeekBarProps> = (props) => {
    const [seekingPosition, setSeekingPosition] = createSignal(0);

    let container!: HTMLSpanElement;

    const handleMouseMove = throttle(({ pageX }) => {
        const { left } = container.getBoundingClientRect();

        setSeekingPosition((pageX - left) / container.offsetWidth);
    }, 10);

    const handleMouseLeave = () => setSeekingPosition(0);

    const handleClick = () => props.onSeek(seekingPosition());

    return (
        <span
            ref={container}
            class="absolute inset-0 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <span
                class="absolute inset-0 bg-primary-100 bg-opacity-40 bg-opacity"
                style={{
                    transform: `translateX(${100 * seekingPosition() - 100}%)`
                }}
            ></span>
        </span>
    );
};

interface Props {
    isPlaying: boolean;
    isMuted: boolean;
    startTime: number;
    volume: number;
    source: string;
    onPlaybackStateChange: (isPlaying: boolean) => void;
    onLoadingStateChange: (isLoading: boolean) => void;
    onTimeUpdate: (t: number) => void;
    onEnd: VoidFunction;
}

const AudioPlayer: Component<Props> = (props) => {
    const [audioState, { seek, setVolume, play, pause }] = createAudio(
        () => props.source,
        () => props.isPlaying,
        () => props.volume / 100
    );

    const progress = createMemo(
        () => (100 * audioState.currentTime) / audioState.duration
    );

    const handleSeeking = (positionPercent: number) =>
        seek(positionPercent * audioState.duration);

    onMount(() => {
        const { volume, startTime } = props;

        setVolume(volume / 100);

        if (startTime) seek(startTime);
    });

    createEffect((previousIsPlaying) => {
        const { isPlaying } = props;

        if (isPlaying !== previousIsPlaying) isPlaying ? play() : pause();

        return isPlaying;
    }, props.isPlaying);

    createEffect((previousIsMuted) => {
        const { isMuted, volume } = props;

        if (isMuted === previousIsMuted) return previousIsMuted;

        if (isMuted) setVolume(0);
        else setVolume(volume / 100);

        return isMuted;
    }, props.isMuted);

    createEffect((previousCurrentTime) => {
        const { currentTime } = audioState;

        if (currentTime !== previousCurrentTime) {
            props.onTimeUpdate(currentTime);
        }

        return currentTime;
    }, audioState.currentTime);

    createEffect((previousState) => {
        const { state, currentTime, duration } = audioState;

        if (state !== previousState) {
            switch (state) {
                case 'loading':
                    props.onLoadingStateChange(true);
                    break;

                case 'ready':
                    props.onLoadingStateChange(false);
                    break;

                case 'playing':
                    props.onPlaybackStateChange(true);
                    break;

                case 'paused':
                    if (currentTime >= duration) props.onEnd();
                    else props.onPlaybackStateChange(false);
                    break;
            }
        }

        return state;
    }, audioState.state);

    return (
        <div class="relative flex flex-grow bg-primary-700 h-3 rounded-lg overflow-hidden cursor-pointer">
            <ProgressBar percentage={progress()} />

            <SeekBar onSeek={handleSeeking} />
        </div>
    );
};

export default AudioPlayer;
