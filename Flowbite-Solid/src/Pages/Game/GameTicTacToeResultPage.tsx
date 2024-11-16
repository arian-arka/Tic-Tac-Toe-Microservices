import {Component, createEffect, createSignal, Show} from "solid-js";
import {useHelper} from "../../Core/Helper";
import {A, Route} from "@solidjs/router";
import Routes from "../../Routes";
import GameApi from "../../Api/Game.api";
import {Ok} from "../../Core/Response/Ok";
import {BadRequest} from "../../Core/Response/BadRequest";
import {NetworkError} from "../../Core/Response/NetworkError";
import Log from "../../Core/Log";
import Loader from "../../Components/Loader";

const GameTicTacToeResultPage: Component = () => {
    const helper = useHelper();
    const [status, setStatus] = createSignal(undefined);
    const searchParams = helper.url.current().searchParams;
    setStatus(searchParams.get('status'));
    const xp = searchParams.get('xp');
    const [stats,setStats] = createSignal(undefined,{equals:false});

    const fetchStats = async () => {
        const f = await (new GameApi(helper)).stats();
        await f({
            ok(r: Ok<any>) {
                setStats(r.props.data);
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
    fetchStats();
    return (
        <>
            <section class="bg-white dark:bg-gray-900">
                <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                    <div class="mx-auto max-w-screen-sm text-center">
                        <Show when={status()}>
                            <Show when={status() === '0'} fallback={
                                <Show when={status() === '2'} fallback={
                                    <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-6xl text-red-600">
                                        Loooooooooooooooser :(
                                    </h1>
                                }>
                                    <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-green-500">
                                        Congrats !!!
                                    </h1>
                                </Show>
                            }>
                                <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 ">
                                    Tie
                                </h1>
                            </Show>
                        </Show>
                        <p class="mb-4 text-3xl text-center tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
                            Rank :  <Loader hidden={!stats()}>{stats().rank}</Loader>
                        </p>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="bg-blue-600 h-2.5 rounded-full" style={`width:${xp}%;`}></div>
                        </div>
                        <p class="my-4 text-lg font-light text-gray-500 dark:text-gray-400">
                            Tic Tac Toe
                        </p>
                        <A href={Routes.home}
                           class="inline-flex text-primary-600 bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Back
                            to Homepage</A>
                    </div>
                </div>
            </section>
        </>
    );
}
export default GameTicTacToeResultPage;