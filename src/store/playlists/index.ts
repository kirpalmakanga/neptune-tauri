import { v4 as uuid } from 'uuid';
import { useStore } from '..';

export const usePlaylists = () => {
    const [{ playlists }, setState] = useStore();

    const createPlaylist = (title: string) =>
        setState('playlists', 'items', (items) => [
            ...items,
            {
                id: uuid(),
                title,
                items: []
            }
        ]);

    const updatePlaylist = (targetId: string, data: Partial<Playlist>) =>
        setState('playlists', 'items', ({ id }) => id === targetId, data);

    const deletePlaylist = (targetId: string) =>
        setState('playlists', 'items', (items) =>
            items.filter(({ id }) => id !== targetId)
        );

    const deletePlaylistItem = (itemId: string, playlistId: string) =>
        setState(
            'playlists',
            'items',
            ({ id }) => id === playlistId,
            'items',
            (items) => items.filter(({ id }) => id !== itemId)
        );

    const clearPlaylist = (targetId: string) =>
        setState(
            'playlists',
            'items',
            ({ id }) => id === targetId,
            'items',
            []
        );

    const getPlaylistByIndex = (targetIndex: number) =>
        playlists.items.find((_, index) => index === targetIndex);

    const getPlaylistById = (targetId: string) =>
        playlists.items.find(({ id }) => id === targetId);

    const addPlaylistItems = (targetPlaylistId: string, items: Track[]) => {
        const playlist = getPlaylistById(targetPlaylistId);

        if (!playlist) throw new Error(`This playlist doesn't exist`);

        /* TODO: if item exists: update object */

        const { items: currentItems = [] } = playlist;
        const currentSources = currentItems.map(({ source }) => source);
        const newItems = items.filter(
            ({ source }) => !currentSources.includes(source)
        );

        if (newItems.length)
            setState(
                'playlists',
                'items',
                ({ id }) => id === targetPlaylistId,
                'items',
                [...currentItems, ...newItems]
            );
    };

    return [
        playlists,
        {
            createPlaylist,
            updatePlaylist,
            deletePlaylist,
            deletePlaylistItem,
            clearPlaylist,
            getPlaylistByIndex,
            getPlaylistById,
            addPlaylistItems
        }
    ] as const;
};
