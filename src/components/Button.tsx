import { Component, JSX, JSXElement, Show, splitProps } from 'solid-js';
import Icon from './Icon';

type ButtonType = 'button' | 'submit' | 'reset' | undefined;

export interface ButtonProps {
    class?: string;
    classList?: { [key: string]: boolean };
    icon?: string;
    iconClass?: string;
    title?: string;
    type?: ButtonType;
    form?: string;
    disabled?: boolean;
    onClick?: JSX.EventHandler<HTMLButtonElement, Event>;
    onBlur?: JSX.EventHandler<HTMLButtonElement, Event>;
    children?: JSXElement;
}

const Button: Component<ButtonProps> = (props) => {
    const [localProps, buttonProps] = splitProps(props, [
        'icon',
        'iconClass',
        'title',
        'children'
    ]);

    return (
        <button {...buttonProps}>
            <Show when={localProps.icon}>
                <Icon
                    class={localProps.iconClass || 'w-5 h-5'}
                    name={localProps.icon || ''}
                />
            </Show>

            <Show when={localProps.title}>
                <span>{localProps.title}</span>
            </Show>

            {localProps.children}
        </button>
    );
};

export default Button;
