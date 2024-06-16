import { createSignal, ParentComponent } from 'solid-js';
import { createMutationObserver } from '@solid-primitives/mutation-observer';

interface Props {
    scrollableClassList?: (isScrollable: boolean) => { [key: string]: boolean };
}

const ScrollContainer: ParentComponent<Props> = (props) => {
    const [isScrollable, setIsScrollable] = createSignal(false);

    let container!: HTMLDivElement;

    createMutationObserver(
        () => container,
        { childList: true, subtree: true },
        () => {
            if (container) {
                const hasScrollableContent =
                    container.scrollHeight > container.clientHeight;

                if (hasScrollableContent !== isScrollable())
                    setIsScrollable(hasScrollableContent);
            }
        }
    );

    return (
        <div class="flex flex-grow relative">
            <div
                class="absolute inset-0 overflow-y-auto"
                classList={
                    props.scrollableClassList &&
                    props.scrollableClassList(isScrollable())
                }
                ref={container}
            >
                {props.children}
            </div>
        </div>
    );
};

export default ScrollContainer;
