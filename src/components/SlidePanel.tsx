import { JSX, ParentComponent, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';
import Button from './Button';

interface Props {
    isVisible: boolean;
    onClickClose: JSX.EventHandler<HTMLElement, Event>;
    title?: string;
}

const SlidePanel: ParentComponent<Props> = (props) => (
    <Portal mount={document.querySelector('#slide-panel') as Node}>
        <Transition name="fade">
            <Show when={props.isVisible}>
                <div
                    class="fixed inset-0 bg-primary-900 bg-opacity-50 z-10 cursor-pointer"
                    onClick={props.onClickClose}
                ></div>
            </Show>
        </Transition>

        <Transition name="slide-left">
            <Show when={props.isVisible}>
                <section class="fixed top-0 right-0 bottom-0 shadow z-11 bg-primary-900 w-1/3 flex flex-col">
                    <header class="flex items-center gap-4 p-4 border-b-1 border-primary-100 font-bold">
                        <Button
                            class="w-5 h-5 text-primary-100 hover:opacity-50 transition-opacity"
                            icon="close"
                            onClick={props.onClickClose}
                        />

                        <Show when={props.title}>
                            <div class="flex-grow text-sm text-primary-100">
                                {props.title}
                            </div>
                        </Show>
                    </header>

                    <div class="flex flex-col flex-grow">{props.children}</div>
                </section>
            </Show>
        </Transition>
    </Portal>
);

export default SlidePanel;
