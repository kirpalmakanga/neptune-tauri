import {
    initialState as playlistsInitialState,
    PlaylistsState
} from './playlists/_state';
import {
    initialState as playerInitialState,
    PlayerState
} from './player/_state';
import {
    initialState as notificationsInitialState,
    NotificationState
} from './notifications/_state';
import {
    initialState as promptInitialState,
    PromptState
} from './prompt/_state';
import { initialState as menuInitialState, MenuState } from './menu/_state';

export interface RootState {
    menu: MenuState;
    playlists: PlaylistsState;
    player: PlayerState;
    notifications: NotificationState;
    prompt: PromptState;
}

export const rootInitialState = (): RootState => ({
    menu: menuInitialState(),
    playlists: playlistsInitialState(),
    player: playerInitialState(),
    notifications: notificationsInitialState(),
    prompt: promptInitialState()
});
