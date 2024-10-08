export {};

declare global {
    interface Window {
        electron: { getFileMetadata: (path: string) => Track };
    }

    interface File {
        path: string;
    }

    interface Track {
        id: string;
        title: string;
        albumTitle: string;
        artists: string;
        albumArtists: string;
        genre: string;
        duration: number;
        trackNumber: number;
        discNumber: string;
        source: string;
        year: number;
        cover: string;
    }

    interface Playlist {
        id: string;
        title: string;
        items: Track[];
    }
}
