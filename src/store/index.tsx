import {
    createContext,
    useContext,
    createEffect,
    ParentComponent
} from 'solid-js';
import { createStore, SetStoreFunction, Store } from 'solid-js/store';
import { makePersisted } from '@solid-primitives/storage';
import { rootInitialState, RootState } from './_state';
import {
    initialState as getInitialPlayerState,
    PlayerState
} from './player/_state';
import {
    initialState as getInitialPlaylistsState,
    PlaylistsState
} from './playlists/_state';
import { mergeDeep } from '../utils/helpers';

const StoreContext = createContext();

export const StoreProvider: ParentComponent = (props) => {
    const [storage, setStorage] = makePersisted(
        createStore<{ player: PlayerState; playlists: PlaylistsState }>({
            player: getInitialPlayerState(),
            playlists: getInitialPlaylistsState()
        }),
        {
            name: 'neptune'
        }
    );
    const store = createStore<RootState>(
        mergeDeep(rootInitialState(), storage) as RootState
    );

    createEffect(() => {
        const [{ playlists, player }] = store;

        setStorage({
            playlists,
            player
        });
    });

    return (
        <StoreContext.Provider value={store}>
            {props.children}
        </StoreContext.Provider>
    );
};

export const useStore = () =>
    useContext(StoreContext) as [Store<RootState>, SetStoreFunction<RootState>];
