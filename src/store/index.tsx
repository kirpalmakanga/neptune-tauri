import {
    createContext,
    useContext,
    createEffect,
    ParentComponent
} from 'solid-js';
import { createStore, SetStoreFunction, Store } from 'solid-js/store';
import { createLocalStorage } from '@solid-primitives/storage';
import { rootInitialState, RootState } from './_state';
import { mergeDeep } from '../utils/helpers';

const StoreContext = createContext();

const storageKey = 'neptune';

export const StoreProvider: ParentComponent = (props) => {
    const [storage, setStorage] = createLocalStorage();
    const store = createStore<RootState>(
        mergeDeep(
            rootInitialState(),
            JSON.parse(storage[storageKey]) || {}
        ) as RootState
    );

    createEffect(() => {
        const [{ playlists, player }] = store;

        setStorage(
            storageKey,
            JSON.stringify({
                playlists,
                player
            })
        );
    });

    return (
        <StoreContext.Provider value={store}>
            {props.children}
        </StoreContext.Provider>
    );
};

export const useStore = () =>
    useContext(StoreContext) as [Store<RootState>, SetStoreFunction<RootState>];
