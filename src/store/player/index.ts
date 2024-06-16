import { useStore } from '..';

export const usePlayer = () => {
    const [{ player }, setState] = useStore();

    const setCurrentTrack = ({
        id: currentTrackId,
        playlistId: currentPlaylistId
    }: {
        id: string;
        playlistId: string;
    }) => setState('player', { currentTrackId, currentPlaylistId });

    const setCurrentTime = (t: number) => setState('player', 'currentTime', t);

    return [player, { setCurrentTrack, setCurrentTime }] as const;
};
