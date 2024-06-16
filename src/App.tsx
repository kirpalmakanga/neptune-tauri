import { onMount, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Transition } from 'solid-transition-group';
import Sprite from './components/Sprite';
// import Prompt from './components/Prompt';
import Playlists from './components/Playlists';
import Player from './components/player/Player';
import Notifications from './components/Notifications';
import { usePlaylists } from './store/playlists';
import Menu from './components/Menu';

const Root: ParentComponent = (props) => {
    const navigate = useNavigate();
    const [, { getPlaylistByIndex }] = usePlaylists();

    onMount(() => {
        const { id } = getPlaylistByIndex(0) || {};

        if (id) navigate(`/playlist/${id}`);
    });

    return (
        <>
            <Sprite />

            <div class="flex flex-col flex-grow">
                <div class="flex flex-grow">
                    <Playlists />

                    <Transition name="fade" mode="outin">
                        {props.children}
                    </Transition>
                </div>
                {/* <Prompt /> */}

                <Player />

                <Menu />

                <Notifications />
            </div>
        </>
    );
};

export default Root;
