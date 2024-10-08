import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
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
            // unlistenFileDrop = await appWindow.onFileDropEvent(
            //     async ({ payload }) => {
            //         console.log(payload);

            //         // console.log({ entries });
            //     }
            // );
            unlistenFileDrop = await listen(
                'tauri://file-drop',
                async ({ payload: paths }) => {
                    console.log(paths);

                    const tracks = await invoke('get_tracks', { paths });

                    console.log({ tracks });

                    // props.onDropFiles(tracks as Track[]);
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

    return (
        <div
            class="relative flex flex-col flex-grow"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            // onDrop={handleDrop}
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
