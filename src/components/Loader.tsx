import { Component } from 'solid-js';
import Icon from './Icon';

const Loader: Component = () => (
    <div class="absolute inset-0 flex justify-center items-center bg-primary-900">
        <Icon class="w-6 h-6" name="loading" />
    </div>
);

export default Loader;
