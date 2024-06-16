import { Component, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import ScrollContainer from './ScrollContainer';

import { usePlaylists } from '../store/playlists';
import SlidePanel from './SlidePanel';
import PlaylistForm, { PlaylistFormState } from './PlaylistForm';
import Button from './Button';

const Playlists: Component = () => {
    const [playlists, { createPlaylist }] = usePlaylists();
    const [isFormOpen, setIsFormOpen] = createSignal(false);

    const handleOpenAddForm = () => setIsFormOpen(true);

    const handleCloseAddForm = () => setIsFormOpen(false);

    const handleFormSubmit = ({ title }: PlaylistFormState) => {
        createPlaylist(title);

        handleCloseAddForm();
    };

    return (
        <header class="flex flex-col w-xs bg-primary-800">
            <div class="flex gap-3 justify-between items-center font-bold p-3">
                <h2 class="text-primary-100">Playlists</h2>

                <Button
                    class="inline-block w-5 h-5 text-primary-100 hover:opacity-50 transition-opacity"
                    icon="add"
                    iconClass="w-5 h-5"
                    onClick={handleOpenAddForm}
                />
            </div>

            <ScrollContainer>
                <ul>
                    <For each={playlists.items}>
                        {(playlist) => (
                            <li>
                                <A
                                    class="flex gap-3 justify-between items-center p-3 no-underline overflow-hidden text-primary-100 hover:bg-primary-600 transition-colors"
                                    activeClass="bg-primary-700 hover:bg-primary-700"
                                    href={`/playlist/${playlist.id}`}
                                >
                                    <span class="text-sm font-bold overflow-ellipsis">
                                        {playlist.title}
                                    </span>

                                    <span class="text-xs">
                                        {`${playlist.items.length} track${
                                            playlist.items.length === 1
                                                ? ''
                                                : 's'
                                        }`}
                                    </span>
                                </A>
                            </li>
                        )}
                    </For>
                </ul>
            </ScrollContainer>

            <SlidePanel
                title="Add playlist"
                isVisible={isFormOpen()}
                onClickClose={handleCloseAddForm}
            >
                <PlaylistForm onSubmit={handleFormSubmit} />
            </SlidePanel>
        </header>
    );
};

export default Playlists;
