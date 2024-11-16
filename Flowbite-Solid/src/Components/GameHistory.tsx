import {Component, createSignal, Show} from "solid-js";
import {A} from "@solidjs/router";
import Routes from "../Routes";
import Loader from "./Loader";
import GameApi from "../Api/Game.api";
import {Ok} from "../Core/Response/Ok";
import {BadRequest} from "../Core/Response/BadRequest";
import {NetworkError} from "../Core/Response/NetworkError";
import Log from "../Core/Log";
import UserApi from "../Api/User.api";
import {useHelper} from "../Core/Helper";

const GameHistory:Component = (props) => {
    const [user,setUser] = createSignal(undefined);
    const game = props.game;
    const helper = useHelper();
    const userId = helper.storage.get('user')['id'];
    const fetchUser = async () => {
        const f = await (new UserApi(helper)).profile(userId == game.player1 ? game.player2 : game.player1);
        await f({
            ok(r: Ok<any>) {
                setUser(r.props.data);
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
    fetchUser();
    return (
        <>
        <Loader hidden={!user()}>
            <div
                class="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
                    <img class="w-auto h-auto rounded-lg sm:rounded-none sm:rounded-l-lg"
                         src={user().avatar_url}
                         alt="Avatar"/>
                <div class="p-5">
                    <h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        <a href={`#`}>{user().name}</a>
                    </h3>
                    <span class="text-gray-500 dark:text-gray-400">@{user().username}</span>

                    <p class="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">
                        Since {`${user().created_at.split('T')[0]} `}
                    </p>
                    <div class="mt-3 mb-4 font-light text-red-600 dark:text-gray-400">
                        <Show when={user().id == -1}>
                        <button class="text-black hover:text-white border border-black font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2  ">
                            Tie
                        </button>
                        </Show>
                        <Show when={user().id != game.winner} fallback={
                            <button class="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2  ">
                                Lost
                            </button>
                        }>
                            <button class="text-blue-600 hover:text-white border border-blue-600 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2  ">
                                Won
                            </button>
                        </Show>
                    </div>
                </div>
            </div>
        </Loader>

        </>
    );
}
export default GameHistory;