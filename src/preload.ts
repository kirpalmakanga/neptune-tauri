// const path = require('path');
const { contextBridge } = require('electron');
const musicMetadata = require('music-metadata');
const mime = require('mime-types');
const { v4: uuid } = require('uuid');

contextBridge.exposeInMainWorld('electron', {
    getFileMetadata: async (filePath) => {
        const {
            common: {
                album,
                albumartist: albumArtists,
                artist: artists,
                disk: { no: discNumber, of: discCount },
                genre,
                picture: [
                    { data: pictureBuffer, format: pictureFormat } = {
                        data: null,
                        format: null
                    }
                ] = [],
                title,
                track: { no: trackNumber },
                year
            },
            format: { duration, codec }
        } = await musicMetadata.parseFile(filePath);

        return {
            id: uuid(),
            title: title || path.parse(filePath).name,
            artists,
            albumArtists,
            album,
            genre: genre ? genre.join(' ').trim() : '',
            year,
            duration,
            trackNumber,
            discNumber,
            discCount,
            cover: pictureBuffer
                ? `data:${pictureFormat};base64,${pictureBuffer.toString(
                      'base64'
                  )}`
                : '',
            codec
        };
    }
});
