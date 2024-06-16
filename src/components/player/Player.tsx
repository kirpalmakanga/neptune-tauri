import { Component, createEffect, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { usePlayer } from '../../store/player';
import { usePlaylists } from '../../store/playlists';
import Button from '../Button';
import { formatTime } from '../../utils/helpers';
import AudioPlayer from './AudioPlayer';
import Img from '../Img';
import Volume from './Volume';

interface State {
    isPlaying: boolean;
    isLoading: boolean;
    isMuted: boolean;
    currentTime: number;
    volume: number;
}

const defaultTrack: Track = {
    id: '',
    title: 'N/A',
    artists: 'N/A',
    albumArtists: '',
    album: '',
    genre: '',
    duration: 0,
    trackNumber: 0,
    discNumber: '1',
    source: '',
    year: 0,
    cover: ''
};

const Player: Component = () => {
    const [playlists] = usePlaylists();
    const [player, { setCurrentTrack, setCurrentTime }] = usePlayer();

    const [state, setState] = createStore<State>({
        isPlaying: false,
        isLoading: false,
        isMuted: false,
        currentTime: player.currentTime,
        volume: player.volume
    });

    const currentPlaylist = createMemo(() =>
        playlists.items.find(({ id }) => id === player.currentPlaylistId)
    );

    const currentTrack = createMemo<Track>(() => {
        const playlist = currentPlaylist();

        if (playlist)
            return (
                playlist.items.find(({ id }) => id === player.currentTrackId) ||
                defaultTrack
            );
        else return defaultTrack;
    });

    const currentTrackIndex = createMemo(() => {
        const index = (currentPlaylist()?.items || []).findIndex(
            ({ id }) => id === player.currentTrackId
        );

        return index > -1 ? index : 0;
    });

    const getPlaylistItemId = (index: number) => {
        const { items: { [index]: { id = null } = {} } = [] } =
            currentPlaylist() || {};

        return id;
    };

    const previousTrackId = createMemo(() =>
        getPlaylistItemId(currentTrackIndex() - 1)
    );

    const nextTrackId = createMemo(() =>
        getPlaylistItemId(currentTrackIndex() + 1)
    );

    const handleTogglePlay = () => setState('isPlaying', !state.isPlaying);

    const handleSkipTrack = (direction: 'previous' | 'next') => () => {
        const id = direction === 'previous' ? previousTrackId() : nextTrackId();

        if (id) {
            setCurrentTrack({ id, playlistId: player.currentPlaylistId });
        }
    };

    const handlePlaybackStateChange = (isPlaying: boolean) =>
        setState('isPlaying', isPlaying);

    const handleLoadingStateChange = (isLoading: boolean) =>
        setState('isLoading', isLoading);

    const handleTimeUpdate = (time: number) => {
        setState('currentTime', time);

        setCurrentTime(time);
    };

    const setVolume = (volume: number) => setState('volume', volume);

    const handleWheelVolume = ({ deltaY }: WheelEvent) => {
        const newVolume = state.volume + (deltaY < 0 ? 5 : -5);
        const inRange = newVolume >= 0 && newVolume <= 100;

        if (inRange) {
            setVolume(newVolume);
        }
    };

    const handleMute = () => setState('isMuted', !state.isMuted);

    const formattedCurrentTime = createMemo(() => {
        const { duration } = currentTrack();

        if (duration) {
            return formatTime(state.currentTime);
        }

        return '--:--';
    });

    const formattedDuration = createMemo(() => {
        const { duration } = currentTrack();

        if (duration) {
            return formatTime(duration);
        }

        return '--:--';
    });

    createEffect((previousTrackId) => {
        const { currentTrackId } = player;

        if (currentTrackId !== previousTrackId && !state.isPlaying)
            setState('isPlaying', true);

        return currentTrackId;
    }, player.currentTrackId);

    return (
        <div class="relative flex items-center bg-primary-900 gap-8">
            <div class="flex items-center w-xs gap-2 p-2">
                <Img
                    class="flex-shrink-0 h-20 w-20"
                    src={currentTrack().cover}
                />

                <div class="flex flex-grow flex-col gap-1 overflow-hidden">
                    <div class="text-primary-100 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {currentTrack().title}
                    </div>

                    <div class="text-primary-200 text-xs overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {currentTrack().artists || defaultTrack.artists}
                    </div>
                </div>
            </div>

            <div class="flex flex-col flex-1 items-center gap-2">
                <div class="flex gap-2">
                    <Button
                        class="w-6 h-6 text-primary-100"
                        classList={{
                            'pointer-events-none opacity-50': !previousTrackId()
                        }}
                        icon="previous"
                        iconClass="w-6 h-6"
                        onClick={handleSkipTrack('previous')}
                    />

                    <Button
                        class="w-6 h-6 text-primary-100"
                        classList={{
                            'pointer-events-none': state.isLoading
                        }}
                        icon={
                            state.isLoading
                                ? 'loading'
                                : state.isPlaying
                                ? 'pause'
                                : 'play'
                        }
                        iconClass="w-6 h-6"
                        onClick={handleTogglePlay}
                    />

                    <Button
                        class="w-6 h-6 text-primary-100"
                        classList={{
                            'pointer-events-none opacity-50': !nextTrackId()
                        }}
                        icon="next"
                        iconClass="w-6 h-6"
                        onClick={handleSkipTrack('next')}
                    />
                </div>

                <div class="w-full flex items-center gap-2 text-sm text-primary-100">
                    <span>{formattedCurrentTime()}</span>

                    <AudioPlayer
                        isPlaying={state.isPlaying}
                        isMuted={state.isMuted}
                        startTime={state.currentTime}
                        volume={state.volume}
                        source={currentTrack().source}
                        onPlaybackStateChange={handlePlaybackStateChange}
                        onLoadingStateChange={handleLoadingStateChange}
                        onTimeUpdate={handleTimeUpdate}
                        onEnd={handleSkipTrack('next')}
                    />

                    <span>{formattedDuration()}</span>
                </div>
            </div>

            <div
                class="flex items-center gap-2 p-2"
                onWheel={handleWheelVolume}
            >
                <Button
                    class="w-6 h-6 text-primary-100"
                    classList={{
                        'pointer-events-none opacity-50': !currentTrack().id
                    }}
                    icon={
                        state.isMuted || state.volume === 0
                            ? 'volume-off'
                            : 'volume-up'
                    }
                    iconClass="w-6 h-6"
                    onClick={handleMute}
                />

                <Volume value={state.volume} onChange={setVolume} />
            </div>
        </div>
    );
};

export default Player;
