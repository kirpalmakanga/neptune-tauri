export interface PlayerState {
    currentPlaylistId: string;
    currentTrackId: string;
    currentTime: number;
    volume: number;
}

export const initialState = (): PlayerState => ({
    currentPlaylistId: '',
    currentTrackId: '',
    currentTime: 0,
    volume: 100
});
