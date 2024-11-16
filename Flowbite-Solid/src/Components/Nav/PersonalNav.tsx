import {A} from "@solidjs/router";
import {Component, createSignal, For, onCleanup, Show} from "solid-js";
import Config from "../../Config";
import {useHelper} from "../../Core/Helper";
import Log from "../../Core/Log";
import Routes from "../../Routes";

export interface NavNotificationInterface {
    message: string,
    footer?: string,
    img?: string,
    icon?: string,
    link?: string
}

export interface NavAppInterface {
    icon?: string,
    name: string,
    link: string
}

export interface NavProfileInterface {
    name?: string,
    img?: string,
    email?: string,
}

export interface NavProfileItemInterface {
    text: string,
    link: string,
}

const PersonalNav: Component = () => {
    const helper = useHelper();

    const [showLayout, setShowLayout] = createSignal<boolean>(helper.storage.get('isAuthenticated') === '1');

    const [header, setHeader] = createSignal<string>(helper.page.get('navHeader', ''));
    const [notifications, setNotifications] = createSignal<NavNotificationInterface[]>(helper.page.get('notifications', []), {equals: false});
    const [apps, setApps] = createSignal<NavAppInterface[]>(helper.page.get('apps', []), {equals: false});
    const [profile, setProfile] = createSignal<NavProfileInterface | {}>(helper.storage.get('profile', {}), {equals: false});
    const [profileItems, setProfileItems] = createSignal<(NavProfileItemInterface[])[]>(helper.page.get('profileItems', []), {equals: false});

    helper.page.subscribe('PersonalNav', (all, changedData) => {
        if ('app' in changedData)
            setApps(all?.apps ?? []);
        if ('notifications' in changedData)
            setNotifications(all?.notifications ?? []);
        if ('navHeader' in changedData)
            setHeader(all?.navHeader ?? '');
        if ('profileItems' in changedData)
            setProfileItems(all?.profileItems ?? []);
    });

    helper.storage.subscribe('PersonalNav', (all,changedData) => {
        if('isAuthenticated' in changedData)
            setShowLayout(all?.isAuthenticated === '1');
        if('profile' in changedData){Log.primary('profile',all);
            setProfile(!!all?.profile ? all?.profile : {});}
    });

    onCleanup(() => {
        helper.storage.unsubscribe('PersonalNav');
        helper.page.unsubscribe('PersonalNav');
    });

    const toggleMenu = () => {
        if (helper.page.get('ShowDefaultAside') === '1')
            helper.page.set('ShowDefaultAside', '0');
        else
            helper.page.set('ShowDefaultAside', '1')
        Log.debug('toggle menu', helper.page.all());
    }

    const fetchLogout = ()=>{
        helper.storage.set('isAuthenticated','0');
    }

    return (
        <>
            <Show when={showLayout()}>
                <header class="sticky top-0 flex-none w-full mx-auto  ">
                    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
                        <div class="flex justify-between items-center">
                            <div class="flex justify-start items-center">
                                <button onClick={toggleMenu} aria-expanded="true" aria-controls="sidebar"
                                        class="hidden p-2 mr-3 text-gray-600 rounded cursor-pointer lg:inline hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                              clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                                <button onClick={toggleMenu} aria-expanded="true" aria-controls="sidebar"
                                        class="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                              clip-rule="evenodd"></path>
                                    </svg>
                                    <svg aria-hidden="true" class="hidden w-6 h-6" fill="currentColor"
                                         viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                              clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="sr-only">Toggle sidebar</span>
                                </button>
                                <a href="https://flowbite.com" class="flex mr-4">
                                    <img src="https://flowbite.s3.amazonaws.com/logo.svg" class="mr-3 h-8"
                                         alt="FlowBite Logo"/>
                                    <span
                                        class="self-center text-sm sm:text-base md:text-xl lg:text-2xl font-semibold whitespace-nowrap dark:text-white">{header()}</span>
                                </a>
                            </div>
                            <div class="flex items-center lg:order-2">
                                {/*<button type="button"*/}
                                {/*        class="hidden sm:inline-flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">*/}
                                {/*    <svg aria-hidden="true" class="mr-1 -ml-1 w-5 h-5" fill="currentColor"*/}
                                {/*         viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">*/}
                                {/*        <path fill-rule="evenodd"*/}
                                {/*              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"*/}
                                {/*              clip-rule="evenodd"></path>*/}
                                {/*    </svg>*/}
                                {/*    New Widget*/}
                                {/*</button>*/}
                                <button type="button" data-dropdown-toggle="notification-dropdown"
                                        class="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
                                    <span class="sr-only">View notifications</span>
                                    <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                                    </svg>
                                </button>

                                {/*Notifications*/}
                                <div
                                    class="hidden overflow-hidden z-50 my-4 max-w-sm text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg dark:divide-gray-600 dark:bg-gray-700"
                                    id="notification-dropdown">
                                    <div
                                        class="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        Notifications
                                    </div>
                                    <div>
                                        <For each={notifications()}>{(n) =>
                                            <A href={!!n.link ? n.link : '#'}
                                               class="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                                                <div class="flex-shrink-0">
                                                    <Show when={!!n.img}>
                                                        <img class="w-11 h-11 rounded-full" src={n.img} alt="Img"/>
                                                    </Show>
                                                    <Show when={!!n.icon}>
                                                        <div
                                                            class="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 rounded-full border border-white bg-primary-700 dark:border-gray-700">
                                                            {n.icon}
                                                        </div>
                                                    </Show>
                                                </div>
                                                <div class="pl-3 w-full">
                                                    <div
                                                        class="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                                                        {n.message}
                                                    </div>
                                                    <div
                                                        class="text-xs font-medium text-primary-700 dark:text-primary-400">
                                                        {n.footer}
                                                    </div>
                                                </div>
                                            </A>
                                        }</For>
                                    </div>
                                    <A href={Routes[Config.allNotificationsRoute]}
                                       class="block py-2 text-base font-normal text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline">
                                        <div class="inline-flex items-center ">
                                            <svg aria-hidden="true" class="mr-2 w-5 h-5" fill="currentColor"
                                                 viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                <path fill-rule="evenodd"
                                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                      clip-rule="evenodd"></path>
                                            </svg>
                                            View all
                                        </div>
                                    </A>
                                </div>


                                <button type="button" data-dropdown-toggle="apps-dropdown"
                                        class="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
                                    <span class="sr-only">View notifications</span>
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                                    </svg>
                                </button>
                                <div
                                    class="hidden overflow-hidden z-50 my-4 max-w-sm text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg dark:bg-gray-700 dark:divide-gray-600"
                                    id="apps-dropdown">
                                    <div
                                        class="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        Apps
                                    </div>
                                    <div class="grid grid-cols-3 gap-4 p-4">
                                        <For each={apps()}>{(a) =>
                                            <A href={a.link}
                                               class="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                                                {!!a.icon ? a.icon : ''}
                                                <div class="text-sm text-gray-900 dark:text-white">{a.name}</div>
                                            </A>
                                        }</For>

                                    </div>
                                </div>
                                <button type="button"
                                    // class="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                        class="  items-center inline-flex p-2.5 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                        id="user-menu-button" aria-expanded="false" data-dropdown-toggle="dropdown">
                                    <span class="sr-only">Open user menu</span>
                                    <Show when={!!profile()?.img} fallback={
                                        <svg fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"
                                             class="w-6 h-6" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    }>
                                        <img class=" w-8 h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 sm:w-8 sm:h-8 rounded-full"
                                             src={profile().img}
                                             alt="user photo"/>
                                    </Show>

                                </button>
                                <div
                                    class="hidden z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                                    id="dropdown">
                                    <div class="py-3 px-4">
                                        <span
                                            class="block text-sm font-semibold text-gray-900 dark:text-white">{profile()?.name}</span>
                                        <span
                                            class="block text-sm font-semibold text-gray-900 dark:text-white">{`@${profile()?.username}`}</span>
                                        <span
                                            class="block text-sm font-light text-gray-500 truncate dark:text-gray-400">{profile()?.email}</span>
                                    </div>
                                    <ul class="py-1 font-light text-gray-500 dark:text-gray-400"
                                        aria-labelledby="dropdown">
                                    <For each={profileItems()}>{(items) =>

                                            <For each={items}>{(item) =>
                                                <li>
                                                    <a href={item.link}
                                                       class="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">
                                                        {item.text}
                                                    </a>
                                                </li>
                                            }</For>
                                    }</For>
                                        <li>
                                            <button onClick={fetchLogout}
                                               class="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">
                                                Logout
                                            </button>
                                        </li>
                                    </ul>

                                </div>
                            </div>
                        </div>
                    </nav>
                </header>
            </Show>
        </>
    );
}

export default PersonalNav;