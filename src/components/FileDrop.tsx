import { listen } from '@tauri-apps/api/event';
import { readDir, BaseDirectory } from '@tauri-apps/api/fs';
import { appWindow } from '@tauri-apps/api/window';
import { createSignal, ParentComponent, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';
import { parseWebStream } from 'music-metadata';

import Icon from './Icon';

interface Props {
    onDropFiles: (files: Track[]) => void;
}

async function readEntriesPromise(
    directoryReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
    return new Promise((resolve, reject) =>
        directoryReader.readEntries(resolve, reject)
    );
}

async function readDirectoryEntries(
    directoryReader: FileSystemDirectoryReader
) {
    let entries = [];

    let readEntries = await readEntriesPromise(directoryReader);

    while (readEntries.length > 0) {
        entries.push(...readEntries);
        readEntries = await readEntriesPromise(directoryReader);
    }

    return entries;
}

async function getAllFileEntries(dataTransferItemList: DataTransferItemList) {
    /* TODO: refacto with proper recursion */
    let fileEntries: FileSystemFileEntry[] = [];

    let queue: FileSystemEntry[] = [];

    for (const item of dataTransferItemList) {
        const entry = item?.webkitGetAsEntry();

        if (entry) queue.push(entry);
    }

    while (queue.length > 0) {
        const entry = queue.shift();

        if (!entry) continue;

        if (entry.isFile) {
            fileEntries.push(entry as FileSystemFileEntry);
        } else if (entry.isDirectory) {
            queue.push(
                ...(await readDirectoryEntries(
                    (entry as FileSystemDirectoryEntry).createReader()
                ))
            );
        }
    }

    return fileEntries;
}

function getFileFromEntry(entry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function getFileMetadata(filePath: string): Track {
    const { body: fileStream } = await fetch(filePath);
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
    } = await parseWebStream(fileStream);

    return {
        id: uuid(),
        // title: title || path.parse(filePath).name, // TODO: récupérer le nom du fichier
        title,
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
            ? `data:${pictureFormat};base64,${pictureBuffer.toString('base64')}`
            : '',
        codec
    };
}

const FileDrop: ParentComponent<Props> = (props) => {
    const [isDraggedOver, setIsDraggedOver] = createSignal(false);
    const [isProcessing, setIsProcessing] = createSignal(false);
    let unlistenFileDrop: Function | null = null;

    async function handleDragOver(e: DragEvent) {
        e.preventDefault();

        if (!unlistenFileDrop) {
            // unlistenFileDrop = await appWindow.onFileDropEvent(
            //     async ({ payload }) => {
            //         console.log(payload);

            //         // console.log({ entries });
            //     }
            // );
            unlistenFileDrop = await listen(
                'tauri://file-drop',
                async ({ payload }) => {
                    console.log(payload);
                    const entries = await readDir('users', {
                        dir: BaseDirectory.AppData,
                        recursive: true
                    });

                    console.log({ entries });
                }
            );
        }

        if (!isDraggedOver()) {
            setIsDraggedOver(true);
        }
    }

    async function handleDragLeave(e: DragEvent) {
        e.preventDefault();

        setIsDraggedOver(false);
    }

    async function handleDrop(e: DragEvent) {
        e.preventDefault();

        const { items } = e.dataTransfer || {};

        if (!items) return;

        const entries = await getAllFileEntries(items);

        if (entries.length) {
            /* TODO: Filter unsupported file types */
            const filteredEntries = [];

            setIsProcessing(true);

            // for (const entry of entries) {
            //     const { path, type } = await getFileFromEntry(entry);

            //     const source = `file://${path}`;

            //     if (type.startsWith('audio/')) {
            //         filteredEntries.push({
            //             ...(await getFileMetadata(source)),
            //             source
            //         });
            //     }
            // }

            console.log({ filteredEntries });

            setIsProcessing(false);

            props.onDropFiles(filteredEntries);
        }

        setIsDraggedOver(false);
    }

    return (
        <div
            class="relative flex flex-col flex-grow"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {props.children}

            <Transition name="fade">
                <Show when={isDraggedOver()}>
                    <div class="absolute inset-0 bg-primary-800 bg-opacity-50 flex p-2">
                        <div class="flex flex-col flex-grow justify-center items-center border-2 border-dashed border-primary-100 border-opacity-50 rounded">
                            <Show
                                when={isProcessing()}
                                fallback={
                                    <>
                                        <Icon
                                            class="w-12 h-12 text-primary-100"
                                            name="file-add"
                                        />

                                        <p class="text-primary-100">
                                            Drop files here.
                                        </p>
                                    </>
                                }
                            >
                                <Icon
                                    class="w-12 h-12 text-primary-100"
                                    name="loading"
                                />

                                <p class="text-primary-100">
                                    Fetching metadata...
                                </p>
                            </Show>
                        </div>
                    </div>
                </Show>
            </Transition>
        </div>
    );
};

export default FileDrop;
