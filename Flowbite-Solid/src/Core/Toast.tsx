import {createSignal, createContext, useContext, Show, Switch, Match} from "solid-js";

import Toast from "../Toast";
import Config from "../Config";
import Log from "./Log";
import {BadRequest} from "./Response/BadRequest";

const ToastContext = createContext();

export type ToastInterface = {
    make : (name: string, props: {
        time?: number,
        props?: any[],
    }) => void,
    firstError(bad : BadRequest,ignoreKeys?:string[]):void,
};

export function ToastProvider(props: any) {
    const [content, setContent] = createSignal<any>(undefined, {equals: false});
    const close = () => setContent(undefined);
    const makeTimeout = (function () {
        let obj: any = undefined;
        return (miliseconds: number) => {
            if (obj)
                clearTimeout(obj);
            else
                obj = setTimeout(() => content() ? close() : null, miliseconds);
        }
    })();
    const all: ToastInterface = {
        make:(name: string, props: {
            time?: number,
            props?: any[],
        }) => {
            Log.debug('making toast', {name, props});
            setContent(Toast[name](...[...props?.props ?? [], close]));
            makeTimeout(props?.time ?? Config.toastTimeout);
        },
        firstError(bad: BadRequest, ignoreKeys?: string[]) {
            all.make('danger',{
                props:[bad.firstError(ignoreKeys)]
            })
        }
    }

    return (
        <ToastContext.Provider value={all}>
            <Show when={content()}>
                <div style="top:3.5rem;"
                    class="right-5 sm:right-5 md:right-12 lg:right-12 animate-[bounce_1.7s_infinite] fixed z-50 flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
                    role="alert">
                    {content()}
                </div>
            </Show>
            {props.children}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastInterface {
    return useContext(ToastContext) as ToastInterface;
}