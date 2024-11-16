import {Component, createEffect, createSignal, For, onCleanup, Show} from "solid-js";
import {useToast} from "../../Core/Toast";
import {useHelper} from "../../Core/Helper";
import {useParams} from "@solidjs/router";
import Log from "../../Core/Log";
import Loader from "../../Components/Loader";
import UserApi from "../../Api/User.api";
import {Ok} from "../../Core/Response/Ok";
import {BadRequest} from "../../Core/Response/BadRequest";
import {NetworkError} from "../../Core/Response/NetworkError";
import MessageApi from "../../Api/Message.api";

const ChatPrivate: Component = () => {
    const params = useParams<{ userId: string }>();
    const userId = parseInt(params.userId);
    const toast = useToast();
    const helper = useHelper();
    const [text, setText] = createSignal("");
    const [user, setUser] = createSignal<any>({name: 'name', username: 'username'});
    const [friend, setFriend] = createSignal(undefined);
    const [connected, setConnected] = createSignal(0);
    const [messages, setMessages] = createSignal<undefined | any[]>(undefined, {equals: false});
    const [socket, setSocket] = createSignal(undefined);

    const getFriend = async (id: string | number) => {
        const f = await (new UserApi(helper)).profile(userId);
        await f({
            async ok(r: Ok<any>) {
                setFriend(r.props.data);
            },
            bad(r: BadRequest) {
                if (r.props.status === 401)
                    helper.storage.set('isAuthenticated', '0');
            },
            network(r: NetworkError) {
                Log.success('network', r.props);
            }
        });
    }
    getFriend(userId);

    const getMessage = async (createdAt: string, userId: string) => {
        const f = await (new MessageApi(helper)).list(createdAt, userId);
        await f({
            async ok(r: Ok<any>) {
                setMessages(r.props.data);
                window.scrollTo(0, document.body.scrollHeight);
            },
            bad(r: BadRequest) {
                if (r.props.status === 401)
                    helper.storage.set('isAuthenticated', '0');
            },
            network(r: NetworkError) {
                Log.success('network', r.props);
            }
        });
    }

    getMessage(new Date(), userId);

    const mergeMessages = (msg: any[]) => {
        setMessages(messages() ? [...messages(), ...msg.reverse()] : msg.reverse());
        console.log(messages());
    }

    const sendMessage = (data: any) => {
        if (!connected()) {
            console.log('trying to send message. but its disconnected');
            return;
        }
        const strData = JSON.stringify({...data, token: helper.storage.get('token')});
        console.log('sending data', strData);
        socket().send(strData);
    }

    const onMessage = (e) => {
        const data: any = JSON.parse(e.data.toString());
        if (data.status == 200)
            mergeMessages([data.data.message]);

    }

    let intervalTrier = undefined;

    createEffect(() => {
        if (!connected()) {
            intervalTrier = setInterval(() => {
                if (connected()) {
                    clearInterval(intervalTrier);
                    return;
                }
                const s = new WebSocket('ws://127.0.0.1:3000/message/socket');
                s.onmessage = onMessage;
                s.onclose = () => setConnected(0);
                s.onopen = () => {
                    setConnected(s.OPEN);
                    Log.debug('socket open', s.OPEN);
                    if (connected())
                        sendMessage({ignore: true});
                };
                setSocket(s);

            }, 4000);
        } else {
            if (intervalTrier)
                clearInterval(intervalTrier);
        }
    })

    const send = () => {
        if (!connected())
            return;
        const message = text().trim();
        if (!!message) {
            sendMessage({
                userId,
                message
            });
            setText("");
        } else
            setText("");
    }


    createEffect(() => {
        messages();
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight)
            window.scrollTo(0, document.body.scrollHeight);
    })

    onCleanup(() => {
        if(connected())
            socket().close();
    })

    return (
        <Loader hidden={!friend()}>
            <div class="">
                <nav
                    class="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                    aria-label="Breadcrumb">
                    <ol class="inline-flex items-center space-x-1 md:space-x-3">
                        <li class="inline-flex items-center">
                            <a href="#"
                               class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                                <svg fill="none" class="w-4 h-4 mr-2" stroke="currentColor" stroke-width="1.5"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"></path>
                                </svg>
                                {/*<svg aria-hidden="true" class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"*/}
                                {/*     xmlns="http://www.w3.org/2000/svg">*/}
                                {/*    <path*/}
                                {/*        d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>*/}
                                {/*</svg>*/}
                            </a>
                        </li>
                        <li>
                            <div class="flex items-center">
                                <svg aria-hidden="true" class="w-6 h-6 text-gray-400" fill="currentColor"
                                     viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                          clip-rule="evenodd"></path>
                                </svg>
                                <p
                                    class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">{friend().name}</p>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div class="flex items-center">
                                <svg aria-hidden="true" class="w-6 h-6 text-gray-400" fill="currentColor"
                                     viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                          clip-rule="evenodd"></path>
                                </svg>
                                <span
                                    class="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">@{friend().username}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div style="overscroll-behavior: none;">
                    <div class="mt-20 mb-16">
                        <Loader hidden={!messages()}>
                            <For each={messages() ?? []}>{(m) =>
                                <>
                                    <Show when={m.src == userId} fallback={
                                        <div class="flex items-end justify-end">
                                            <div
                                                class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                                                <div><span
                                                    class="mx-4 my-2 p-2  inline-block rounded-br-none bg-blue-500 text-white rounded-lg">
                                                {m.message}
                                            </span></div>
                                            </div>
                                        </div>
                                        // <div class="float-left inline-block w-1/2">
                                        //     <div
                                        //         class="bg-blue-300 float-right mx-4 my-2 p-2 rounded-lg"
                                        //     >{m.message}
                                        //     </div>
                                        // </div>
                                    }>
                                        <div class="flex items-end  w-full">
                                            <div
                                                class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start w-full">
                                                <div>
                                                <span
                                                    class="w-full mx-4 my-2 p-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                                                {m.message}
                                            </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/*<div class="float-right  inline-block w-1/2">*/}
                                        {/*    <div*/}
                                        {/*        class="bg-gray-300 w-1/2 mx-4 my-2 p-2 rounded-lg"*/}
                                        {/*    >{m.message}*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                    </Show>
                                    {/*<br/>*/}
                                </>
                            }</For>
                        </Loader>
                    </div>
                </div>

                <div class="fixed w-full flex justify-between  border border-gray-200 rounded-lg bg-gray-50 "
                     style="bottom: 0px;">
      <textarea onInput={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        send();
                    }
                }}
                class="flex-grow m-2 py-2 px-4 mr-1 rounded-full border border-gray-300 bg-gray-200 resize-none"
                rows="1"
                value={text()}
                placeholder="Message..."
                style="outline: none;"
      ></textarea>
                    <button class="m-2" style="outline: none;" onClick={send}>
                        <Show when={connected()} fallback={
                            <div class="text-center">
                                <div role="status">
                                    <svg aria-hidden="true"
                                         class="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"/>
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"/>
                                    </svg>
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                        }>
                            <svg
                                class="svg-inline--fa text-blue-600 fa-paper-plane fa-w-16 w-12 h-12 py-2 mr-2"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fas"
                                data-icon="paper-plane"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"
                                />
                            </svg>
                        </Show>

                    </button>
                </div>
            </div>
        </Loader>
    )
}

export default ChatPrivate;