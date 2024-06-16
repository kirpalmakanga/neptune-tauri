import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import App from './App';
import { StoreProvider } from './store';
import Playlist from './pages/Playlist';

import 'virtual:windi.css';
import './assets/styles/main.scss';

const appContainer = document.querySelector('#app');
const loader = document.querySelector('#app-loader');

if (appContainer) {
    render(
        () => (
            <StoreProvider>
                <Router root={App}>
                    <Route path="/" />
                    <Route path="/playlist/:playlistId" component={Playlist} />
                </Router>
            </StoreProvider>
        ),
            appContainer
    );
}

if (loader) {
    loader.addEventListener('transitionend', () => loader.remove(), {
        once: true
    });
    loader.classList.add('is--hidden');
}
