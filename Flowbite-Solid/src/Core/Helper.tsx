import {createContext, createEffect, createMemo, createSignal, useContext} from "solid-js";
import {useLocation, useNavigate} from "@solidjs/router";
import OnStorage from "../Event/OnStorage";
import Routes from "../Routes";
import Log from "./Log";

const HelperContext = createContext();

const localStorageToObj = () => {
    const data: any = {};
    let tmp;

    for (let key of Object.keys(localStorage)) {
        tmp = localStorage.getItem(key);
        if (tmp === null || tmp === undefined)
            data[key] = null;
        else
            data[key] = JSON.parse(tmp);
    }

    return data;
}

export interface HelperInterface {
    url: {
        subscribe(name: string, callback: (current : URL, previous: URL | undefined) => void): void,
        unsubscribe(name: string): void,
        current(): URL,
        previous(): URL | undefined,
    }
    storage: {
        all(): any,
        get(key: string, def?: any): any,
        set(key: string, val: any): void,
        unset(key: string): void,
        clear(fireEvents: false): void,
        subscribe(name: string, callback: (all: { [key: string]: any }, changedData: { [key: string]: any }) => void): void,
        unsubscribe(name: string): void,
    },

    page: {
        all(): any,
        get(key: string, def?: any): any,
        set(key: string, val: any): void,
        unset(key: string): void,
        clear(fireEvents: false): void,
        subscribe(name: string, callback: (all: { [key: string]: any }, changedData: { [key: string]: any }) => void): void,
        unsubscribe(name: string): void,
    }

    route(name: string): void,

    redirect(url: string): void,

    away(url: string): void,

}

export function HelperProvider(props: any) {
    const navigate = useNavigate();
    const _location = useLocation();

    const [storage, setStorage] = createSignal<any>({}, {equals: false});
    const [pageVars, setPageVars] = createSignal<any>({}, {equals: false});
    const [toast,setToast] = createSignal<boolean>(false);
    const storageCallbacks: any = {};
    const pageVarsCallbacks: any = {};
    const urlCallbacks: any = {};

    const onUrl = () =>{
        const complete = new URL(window.location.href);
        const completePrevious = !!document.referrer ? new URL(document.referrer) : undefined;
        for (let key in urlCallbacks)
            urlCallbacks[key](complete, completePrevious);
    }

    window.onhashchange = onUrl;

    //onPage
    const onPage = (changedKey) => {
        const _ = pageVars();
        for (let key in pageVarsCallbacks)
            pageVarsCallbacks[key](_, !!changedKey ? {[changedKey]: _[changedKey]} : _);
    }
    const onStorage = (changedKey) => {
        const oldVals = storage();
        const newVals = localStorageToObj();
        setStorage(newVals);

        for (let key in OnStorage)
            OnStorage[key](oldVals[key], newVals[key], all);
        for (let key in storageCallbacks)
            storageCallbacks[key](newVals, !!changedKey ? {[changedKey]: newVals[changedKey]} : newVals);
    }


    const all: HelperInterface = {
        'url': {
            subscribe(name: string, callback: (current: URL, previous: (URL | undefined)) => void) {
                urlCallbacks[name] = callback;
            },
            unsubscribe(name: string) {
                if (name in urlCallbacks) delete urlCallbacks[name];
            },
            current(): URL {
                return new URL(window.location.href)
            },
            previous(): URL | undefined {
                return !!document.referrer ? new URL(document.referrer) : undefined;
            }
        },
        'page': {
            set(key: string, val: any) {
                const _ = pageVars();
                _[key] = val;
                setPageVars(_);
                onPage(key);
            },
            get(key: string, def = null): any {
                const _ = pageVars();
                const v = key in _ ? _[key] : null;
                return v === null || v === undefined ? def : v;
            },
            all(): any {
                return pageVars();
            },
            unset(key: string) {
                const _ = pageVars();
                key in _ ? delete _[key] : null;
                onPage(key);
            },
            clear() {
                setPageVars({});
                onPage(undefined);
            },
            subscribe(name: string, callback: (all: { [p: string]: any }, changedData: { [p: string]: any }) => void) {
                pageVarsCallbacks[name] = callback;
            },
            unsubscribe(name: string) {
                if (name in pageVarsCallbacks) delete pageVarsCallbacks[name];
            }
        },
        'storage': {
            all() {
                return storage();
            },
            set(key: string, val: any) {
                localStorage.setItem(key, JSON.stringify(val));
                onStorage(key);
            },
            get(key: string, def = null) {
                const _ = storage();
                const v = key in _ ? _[key] : null;
                return v === null || v === undefined ? def : v;
            },
            unset(key: string) {
                localStorage.removeItem(key);
                onStorage(key);
            },
            clear(fireEvents: false) {
                if (!fireEvents)
                    localStorage.clear();
                else {
                    localStorage.clear();
                    onStorage(undefined);
                }
            },
            subscribe(name: string, callback: (all: { [p: string]: any }, changedData: { [p: string]: any }) => void) {
                storageCallbacks[name] = callback;
            },
            unsubscribe(name: string) {
                if (name in storageCallbacks) delete storageCallbacks[name];
            }
        },
        route(name: string) {
            navigate(Routes[name]);
        },
        redirect(url: string) {
            navigate((new URL(url, Routes.gteBase())).toString());
        },
        away(url: string) {
            location.href = url;
        },

    };

    onStorage();


    return (
        <HelperContext.Provider value={all}>
            {props.children}
        </HelperContext.Provider>
    );
}

export function useHelper(): HelperInterface {
    return useContext(HelperContext) as HelperInterface;
}