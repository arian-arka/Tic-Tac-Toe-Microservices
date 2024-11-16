import {Component, createEffect, createSignal, For, onCleanup, Show} from "solid-js";
import LoadingButton from "../../Components/Button/LoadingButton";
import Log from "../../Core/Log";
import {useHelper} from "../../Core/Helper";
import {useToast} from "../../Core/Toast";
import Routes from "../../Routes";
import {useNavigate} from "@solidjs/router";

const buttonClass = "w-11 h-11 lg:w-36 lg:h-36 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 shadow-lg shadow-teal-500/50 font-medium rounded-lg text-2xl  text-center ";
const xButtonClass = "w-11 h-11 lg:w-36 lg:h-36  text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-2xl text-center ";
const oButtonClass = "w-11 h-11 lg:w-36 lg:h-36 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-2xl  text-center ";

const GameTicTacToePage: Component = () => {
    const helper = useHelper();
    const toast = useToast();
    const navigate = useNavigate();
    const [buttonLoader,setButtonLoader] = createSignal(undefined);
    const [status, setStatus] = createSignal<number>(2);
    const [ignore, setIgnore] = createSignal<boolean>(false);
    const [yourTurn, setYourTurn] = createSignal<boolean|undefined>(undefined);
    const [opponent, setOpponent] = createSignal<string | undefined | false>(undefined);
    const [connected, setConnected] = createSignal(0);
    const [socket, setSocket] = createSignal(undefined);
    const [game,setGame] = createSignal(undefined);

    let intervalTrier = undefined;

    const player = helper.storage.get('user')['id'];

    const checkTurn = () => {
        const playerMoves = game()?.map.filter(x => x == player).length;
        const opponentMoves = game()?.map.filter(x => x != player && x!=-1).length;
        console.log('turns');
        console.log(playerMoves);
        console.log(opponentMoves);
        setYourTurn(playerMoves < opponentMoves ? true : (playerMoves === opponentMoves ? player == game().player1 : false));
    }

    const onMessage = (e) => {
        const data: any = JSON.parse(e.data.toString());
        console.log('onMessage data', data);
        if(buttonLoader())
            (buttonLoader())(false);
        if (data.status == 200) {
            if(data.data.type === 'ignore' || data.data.type === 'status'){
                setGame(data.data.game);
                checkTurn();
            }else if(data.data.type === 'tie'){
                location.href=`${Routes['tictactoe-result']}?status=0`;
                setGame(data.data.game);
                console.log('tie');
            }else if(data.data.type === 'end'){
                location.href=`${Routes['tictactoe-result']}?status=${data.data.game.winner == player ? '2' : '1'}`;
                setGame(data.data.game);
                console.log('win');
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
                const s = new WebSocket('ws://127.0.0.1:3000/game/socket');
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


    const makeMove = (number, setLoading) => {
        if (!yourTurn())
            return;
        setLoading(true);
        setButtonLoader(setLoading);
        sendMessage({
            type:'move',
            index : number,
        })
    }
    const endOfGame = (status: number) => {
        //-1 : loss , 0 :tie, 1 : win
    }

    const leaveGame = (setLoading) => {
        setLoading(true);
        setButtonLoader(setLoading);
        sendMessage({
            type:'leave'
        });
    }


    return (<>

        <section class="bg-white dark:bg-gray-900">
            <div class="">

                <div class="flex items-center justify-center text-center">
                    {/*<Show when={opponent() === undefined} fallback={*/}
                        <Show when={yourTurn() === undefined} fallback={
                            <div class="flex items-center justify-center text-center">
                  <span
                      class={`${yourTurn() ? ' bg-green-100 text-green-800' : ' bg-red-100 text-red-800'} text-center text-2xl font-semibold mr-2 px-2.5 py-0.5 rounded`}>
                      {yourTurn() ? 'Your turn' : 'Opponent turn...'}
                  </span>
                            </div>
                        }>

                            <p class="font-normal text-gray-700 dark:text-gray-400 opacity-20">
                                ...
                            </p>
                        </Show>
                    {/*}>*/}

                    {/*    <p class="font-normal text-gray-700 dark:text-gray-400 opacity-20">*/}
                    {/*        Waiting for opponent to join*/}
                    {/*    </p>*/}
                    {/*    <div role="status"*/}
                    {/*         class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">*/}

                    {/*    </div>*/}
                    {/*</Show>*/}
                </div>
            </div>
        </section>

        <Show when={game() }>
            <div class="m-11 relative p-4 bg-white rounded-2xl shadow sm:p-5">
                <div class="grid grid-cols-3 gap-4 place-items-center">
                    <For each={game().map}>{(v, index) =>

                        <div>
                            <LoadingButton
                                class={v != -1   ? ((v == player && game().player1 == player) || (v != player && game().player1 != player) ? xButtonClass : oButtonClass) : buttonClass}
                                onClick={(setLoading) => {
                                    if (v === -1)
                                        makeMove(index(), setLoading);
                                }}
                                loadingText=""
                            >
                                {v != -1 ? ((v == player && game().player1 == player) || (v != player && game().player1 != player) ? 'X' : 'O') : ''}
                            </LoadingButton>
                        </div>
                    }</For>
                </div>
            </div>

            <div class="container mx-0 min-w-full flex flex-col items-center">
                <LoadingButton
                    class={"w-1/4 left-1/2 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"}
                    onClick={leaveGame}
                    loadingText=""
                >
                    Leave
                </LoadingButton>
            </div>

        </Show>


    </>);
}

export default GameTicTacToePage;