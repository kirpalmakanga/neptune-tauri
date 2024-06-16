import { v4 as uuid } from 'uuid';

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
