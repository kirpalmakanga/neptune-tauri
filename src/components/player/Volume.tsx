import { Component, JSX } from 'solid-js';

interface Props {
    value: number;
    onChange: (value: number) => void;
}

const Volume: Component<Props> = (props) => {
    const handleUpdate: JSX.EventHandler<HTMLInputElement, Event> = ({
        currentTarget: { value }
    }) => props.onChange(parseInt(value));

    return (
        <input
            class="w-full"
            type="range"
            min="0"
            max="100"
            value={props.value}
            onChange={handleUpdate}
        />
    );
};

export default Volume;
