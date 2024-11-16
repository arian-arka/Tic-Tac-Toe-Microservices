import {A} from "@solidjs/router";
import {Component, createSignal, For, Show} from "solid-js";
import {useHelper} from "../../Core/Helper";
import UserApi from "../../Api/User.api";
import {Ok} from "../../Core/Response/Ok";
import {BadRequest} from "../../Core/Response/BadRequest";
import {NetworkError} from "../../Core/Response/NetworkError";
import Log from "../../Core/Log";
import Loader from "../../Components/Loader";
import Routes from "../../Routes";
import {useToast} from "../../Core/Toast";
import GameHistory from "../../Components/GameHistory";
import GameApi from "../../Api/Game.api";
import Lang from "../../Core/Lang";

const GameHistoryPage: Component = () => {
    const toast = useToast();
    const helper = useHelper();
    const [rows, setRows] = createSignal([], {equals: false});
    const [pagination, setPagination] = createSignal(undefined, {equals: false});
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
    const fetchList = async (page) => {
        const f = await (new GameApi(helper)).list({
            page,
            linkPerPage: 5,
            limit: 2,
        });
        await f({
            ok(r: Ok<any>) {
                setPagination(r.props.data.pagination);
                setRows(r.props.data.data);
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
    fetchList(1);
    const onPage = (page) => fetchList(page);

    return (
        <>

            <section class="bg-white dark:bg-gray-900">
                <p class="mb-4 text-3xl text-center tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
                    Rank :  <Loader hidden={!stats()}>{stats().rank}</Loader>
                </p>
                <div class="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6">
                    <dl class="grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white">
                        <div class="flex flex-col items-center justify-center">
                            <dt class="mb-2 text-3xl md:text-4xl font-extrabold text-green-500">
                                <Loader hidden={!stats()}>{stats().won}</Loader>
                            </dt>
                            <dd class="font-light text-gray-500 dark:text-gray-400">Won</dd>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <dt class="mb-2 text-3xl md:text-4xl font-extrabold text-red-600">
                                <Loader hidden={!stats()}>{stats().lost}</Loader>
                            </dt>
                            <dd class="font-light  dark:text-gray-400 ">Lost</dd>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <dt class="mb-2 text-3xl md:text-4xl font-extrabold text-yellow-400">
                                <Loader hidden={!stats()}>{stats().tie}</Loader>
                            </dt>
                            <dd class="font-light text-gray-500 dark:text-gray-400">Tie</dd>
                        </div>
                    </dl>
                </div>
            </section>
            <section class="bg-white dark:bg-gray-900">
                <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6 ">
                    <div class="mx-auto max-w-screen-sm text-center mb-8 lg:mb-16">
                        <p class="text-gray-500 dark:text-gray-400">
                            Game History
                        </p>
                    </div>
                    <Loader hidden={!rows() }>
                        <div class="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
                            <For each={rows()}>{(r) =>
                                <GameHistory game={r}/>
                            }</For>
                        </div>
                        <nav
                            class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                            aria-label="Table2 navigation">
                            <Show when={rows()?.length ?? 0}>
                             <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                                 {Lang.get('table.paginationNumbers', rows().length ?? 0, ...(pagination() ? [pagination().totalSoFar, pagination().total] : []))}
                            </span>
                            </Show>
                            <Show when={pagination()    }>
                                <ul class="inline-flex items-stretch -space-x-px">
                                    <Show when={pagination()?.firstPage}>
                                        <li>
                                            <a onClick={() => onPage(pagination().firstPage)}
                                               class="cursor-pointer flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white   hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                {Lang.get('table.paginationFirstPage')}
                                            </a>
                                        </li>
                                    </Show>
                             {/*       <Show when={pagination()?.previous}>
                                        <li>
                                            <a onClick={() => onPage(pagination().previous)}
                                               class="cursor-pointer flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                <span class="sr-only">{Lang.get('table.paginationPrevious')}</span>
                                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor"
                                                     viewBox="0 0 20 20"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd"
                                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                          clip-rule="evenodd"></path>
                                                </svg>
                                            </a>
                                        </li>
                                    </Show>*/}
                                    <For each={pagination()?.pages ?? []}>{(page) =>
                                        <li>
                                            <a onClick={() => onPage(page)} class={
                                                page == pagination().current
                                                    ? 'cursor-pointer flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                                                    : 'cursor-pointer flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                            }>{page}</a>
                                        </li>
                                    }
                                    </For>
                                    {/*<Show when={pagination()?.next}>*/}
                                    {/*    <li>*/}
                                    {/*        <a onClick={() => onPage(pagination().next)}*/}
                                    {/*           class="cursor-pointer flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">*/}
                                    {/*            <span class="sr-only">{Lang.get('table.paginationNext')}</span>*/}
                                    {/*            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor"*/}
                                    {/*                 viewBox="0 0 20 20"*/}
                                    {/*                 xmlns="http://www.w3.org/2000/svg">*/}
                                    {/*                <path fill-rule="evenodd"*/}
                                    {/*                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"*/}
                                    {/*                      clip-rule="evenodd"></path>*/}
                                    {/*            </svg>*/}
                                    {/*        </a>*/}
                                    {/*    </li>*/}
                                    {/*</Show>*/}
                                    <Show when={pagination()?.lastPage}>
                                        <li>
                                            <a onClick={() => onPage(pagination().lastPage)}
                                               class="cursor-pointer flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white  hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                {Lang.get('table.paginationLastPage')}
                                            </a>
                                        </li>
                                    </Show>
                                </ul>
                            </Show>
                        </nav>
                    </Loader>

                </div>
            </section>
        </>
    )
}

export default GameHistoryPage;