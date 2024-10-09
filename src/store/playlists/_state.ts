export interface PlaylistsState {
    items: Playlist[];
}

export const initialState = (): PlaylistsState => ({
    items: [
        {
            id: 'default',
            title: 'Default',
            items: []
        }
    ]
});
