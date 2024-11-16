import {Component, createEffect, createSignal, onCleanup, Show} from "solid-js";
import {A, Route} from "@solidjs/router";
import Routes from "../../Routes";
import LoadingButton from "../../Components/Button/LoadingButton";
import UserApi from "../../Api/User.api";
import {Ok} from "../../Core/Response/Ok";
import {BadRequest} from "../../Core/Response/BadRequest";
import {NetworkError} from "../../Core/Response/NetworkError";
import Log from "../../Core/Log";
import {useHelper} from "../../Core/Helper";
import Loader from "../../Components/Loader";
import {useToast} from "../../Core/Toast";
import GameApi from "../../Api/Game.api";

const GameTicTacToeLobby: Component = () => {
    const helper = useHelper();
    const toast = useToast();

    const [status, setStatus] = createSignal(undefined);
    const [user, setUser] = createSignal(undefined);
    const [game, setGame] = createSignal(undefined);
    const [connected, setConnected] = createSignal(0);
    const [socket, setSocket] = createSignal(undefined);

    createEffect(() => {
        console.log('statussss', status());
    })

    const startGame = async () => {
        const f = await (new GameApi(helper)).start(user().id);
        await f({
            ok(r: Ok<any>) {
                setStatus(1);
            },
            bad(r: BadRequest) {
                if (r.props.status === 401)
                    helper.storage.set('isAuthenticated', '0');
                if (r.props.status === 403)
                    toast.make('warning', {
                        props: [r.props.data.message]
                    })
            },
            network(r: NetworkError) {
                Log.success('network', r.props);
            }
        });
    }

    const acceptGame = async (accept: boolean) => {
        if (game() && accept && helper.storage.get('user')['id'] == game().player1)
            return;
        const f = await (new GameApi(helper)).accept(accept);
        await f({
            ok(r: Ok<any>) {
                if (!accept)
                    setStatus(0);
                else
                    setStatus(2);
            },
            bad(r: BadRequest) {
                if (r.props.status === 401)
                    helper.storage.set('isAuthenticated', '0');
                if (r.props.status === 403)
                    toast.make('warning', {
                        props: [r.props.data.message]
                    })
            },
            network(r: NetworkError) {
                Log.success('network', r.props);
            }
        });
    }

    const lookForOpponent = async (setLoading) => {
        setLoading(true);
        const f = await (new UserApi(helper)).random();
        await f({
            ok(r: Ok<any>) {
                setUser(r.props.data);
            },
            bad(r: BadRequest) {
                setUser(null);
                if (r.props.status === 401)
                    helper.storage.set('isAuthenticated', '0');
            },
            network(r: NetworkError) {
                setUser(null);
                Log.success('network', r.props);
            }
        });

        setLoading(false);
    }

    let intervalTrier = undefined;

    const onMessage = (e) => {
        const data: any = JSON.parse(e.data.toString());
        console.log('onMessage data', data);
        if (data.status == 200) {
            if ('hasGame' in data.data) {
                if (data.data?.hasGame === false) {
                    if (data.data?.waiting === true) {
                        const game = data.data.game;
                        setGame(game);
                        setUser(data.data.opponent);
                        setStatus(1);
                    } else
                        setStatus(0);
                } else
                    helper.route('tictactoe');
            } else if ('type' in data.data) {
                if (data.data.type === 'decline')
                    setStatus(0);
                else if (data.data.type === 'start')
                    helper.route('tictactoe');
            }
        }
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

    createEffect(() => {
        if (!connected()) {
            intervalTrier = setInterval(() => {
                if (connected()) {
                    clearInterval(intervalTrier);
                    return;
                }
                const s = new WebSocket('ws://127.0.0.1:3000/game/lobby');
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

    onCleanup(() => {
        if (connected())
            socket().close();
    })

    return (
        <>

            <section
                class="bg-white dark:bg-gray-900 bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')]">
                <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
                    <A href={Routes.home}
                       class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800">
                        <span class="text-xs bg-blue-600 rounded-full text-white px-4 py-1.5 mr-3">Home</span> <span
                        class="text-sm font-medium">Discover other games</span>
                        <svg aria-hidden="true" class="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clip-rule="evenodd"></path>
                        </svg>
                    </A>
                    <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                        Tic Tac Toe
                    </h1>
                    <Loader hidden={status() === undefined}>
                        <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">
                            Waiting for opponent to match
                        </p>
                        <Show when={status() !== undefined}>
                            <Show when={user()}>
                                <div class="flex justify-center items-center">
                                    <div
                                        class="lg:w-1/3 md:w-1/3 sm:w-1/2 w-full my-4  bg-white  border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                        <div class="flex flex-col items-center py-10">
                                            <img class="w-24 h-24 mb-3 rounded-full shadow-lg"
                                                 src={user().avatar_url} alt="Bonnie image"/>
                                            <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{user().name}</h5>
                                            <span
                                                class="text-sm text-gray-500 dark:text-gray-400">{`@${user().username}`}</span>
                                            <div class="flex mt-4 space-x-3 md:mt-6">
                                                <Show when={status() === 1}>
                                                    <>
                                                        <Show
                                                            when={!(game() && helper.storage.get('user')['id'] == game().player1)}>
                                                            <LoadingButton
                                                                class={"inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"}
                                                                onClick={async () => await acceptGame(true)}
                                                                loadingText="Fetching..."
                                                            >
                                                                Accept
                                                            </LoadingButton>
                                                        </Show>
                                                        <LoadingButton
                                                            class={"inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300"}
                                                            onClick={async () => await acceptGame(false)}
                                                            loadingText="Fetching..."
                                                        >
                                                            Decline
                                                        </LoadingButton>
                                                    </>
                                                </Show>
                                                <Show when={status() === 0}>
                                                    <button onClick={startGame}
                                                            class="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                        Start
                                                    </button>
                                                </Show>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                            <div class="w-full max-w-md mx-auto">
                                <Show when={status() < 1 || !status()}>
                                    <LoadingButton
                                        class={"text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"}
                                        onClick={lookForOpponent}
                                        loadingText="Looking for available users..."
                                    >
                                        Search
                                    </LoadingButton>
                                </Show>
                            </div>
                        </Show>
                    </Loader>
                </div>
                <div
                    class="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900 w-full h-full absolute top-0 left-0 z-0"></div>
            </section>

        </>
    );
}

export default GameTicTacToeLobby;