import { Component, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
import { preventDefault } from '../utils/helpers';
import Button from './Button';

interface Props {
    id?: string;
    onSubmit: (data: any) => void;
}

export interface PlaylistFormState {
    title: string;
}

const PlaylistForm: Component<Props> = (props) => {
    const [state, setState] = createStore<PlaylistFormState>({
        title: ''
    });

    const handleInput =
        (
            key: keyof PlaylistFormState
        ): JSX.EventHandlerUnion<HTMLInputElement, InputEvent> =>
        ({ currentTarget: { value } }) =>
            setState(key, value);

    const handleSubmit = () => props.onSubmit(state);

    return (
        <form
            id={props.id}
            class="flex flex-col flex-grow p-4"
            onSubmit={preventDefault(handleSubmit)}
        >
            <div class="flex flex-col flex-grow">
                <label
                    for="playlist-title"
                    class="text-sm text-primary-100 mb-1"
                >
                    Title
                </label>

                <input
                    id="playlist-title"
                    class="bg-primary-600 text-primary-100 focus:outline-none p-2"
                    type="text"
                    onInput={handleInput('title')}
                    required
                />
            </div>

            <Button
                class="p-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-400 transition-colors text-primary-100 shadow rounded"
                title="Submit"
                type="submit"
            />
        </form>
    );
};

export default PlaylistForm;
