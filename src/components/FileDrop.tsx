import { invoke } from '@tauri-apps/api/core';
import { Event, listen } from '@tauri-apps/api/event';
import { createSignal, ParentComponent, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';

import Icon from './Icon';

interface Props {
    onDropFiles: (files: Track[]) => void;
}

const FileDrop: ParentComponent<Props> = (props) => {
    const [isDraggedOver, setIsDraggedOver] = createSignal(false);
    const [isProcessing, setIsProcessing] = createSignal(false);
    let unlistenFileDrop: Function | null = null;

    async function handleDragOver(e: DragEvent) {
        e.preventDefault();

        if (!unlistenFileDrop) {
            unlistenFileDrop = await listen(
                'tauri://drag-drop',
                async ({ payload: { paths } }: Event<{ paths: string[] }>) => {
                    setIsProcessing(true);

                    const tracks = await invoke<Track[]>('get_tracks', {
                        paths
                    });

                    setIsProcessing(false);

                    props.onDropFiles(tracks);
                }
            );
        }

        if (!isDraggedOver()) {
            setIsDraggedOver(true);
        }
    }

    async function handleDragLeave(e: DragEvent) {
        e.preventDefault();

        unlistenFileDrop?.();

        unlistenFileDrop = null;

        setIsDraggedOver(false);
    }

    return (
        <div
            class="relative flex flex-col flex-grow"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {props.children}

            <Transition name="fade">
                <Show when={isDraggedOver() || isProcessing()}>
                    <div class="absolute inset-0 bg-primary-800 bg-opacity-50 flex p-2 pointer-events-none">
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
                                    Fetching tracks' metadata...
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
