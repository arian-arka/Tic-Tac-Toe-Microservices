import {Component, createSignal} from "solid-js";
import TextInput from "../../Components/Input/TextInput";
import {useHelper} from "../../Core/Helper";
import LoadingButton from "../../Components/Button/LoadingButton";
import {useToast} from "../../Core/Toast";
import {A} from "@solidjs/router";
import Routes from "../../Routes";
import UserApi from "../../Api/User.api";
import Log from "../../Core/Log";
import {Ok} from "../../Core/Response/Ok";
import {BadRequest} from "../../Core/Response/BadRequest";
import {NetworkError} from "../../Core/Response/NetworkError";

const UserLoginPage: Component = () => {
    const helper = useHelper();
    const toast = useToast();
    helper.page.set('ShowDefaultAside','0');
    const [data, setData] = createSignal<any>({}, {equals: false});
    const fetchLogin = async (setLoading) => {
        setLoading(true);
        const api = await (new UserApi(helper)).login(data());
        Log.debug('data',data());
        await api({
            ok(r: Ok<any>) {
                helper.storage.set('token',r.props.data.token);
                helper.storage.set('user',r.props.data.user);
                helper.storage.set('profile',{
                    img : r.props.data.user.avatar_url,
                    name : r.props.data.user.name,
                    username : r.props.data.user.username,
                    email : r.props.data.user.email,
                });
                helper.storage.set('isAuthenticated','1');
                helper.route('home');
                //helper.route('home');
            },
            bad(r: BadRequest) {
                if(r.props.status === 401)
                    helper.storage.set('isAuthenticated','0');
                toast.firstError(r);
            },
            network(r: NetworkError) {
                Log.success('network',r.props);
            }
        });
        setLoading(false);
    }
    const setOneData = (key, val) => {
        const _ = data();
        _[key] = val;
        setData(_);
    }
    return (
        <>
            <section class="bg-gray-50 dark:bg-gray-900 ">
                <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
                    <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">

                        {/*<img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">*/}
                        {/*    Flowbite*/}
                    </a>
                    <div
                        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Sign in to your account
                            </h1>
                            <form class="space-y-4 md:space-y-6" action="#">
                                <TextInput
                                    label="Username"
                                    floating={true}
                                    onChange={(val) => setOneData('username',val)}
                               />
                                <TextInput
                                    type="password"
                                    label="Password"
                                    floating={true}
                                    onChange={(val) => setOneData('password',val)}
                                />
                                <div class="flex items-center justify-between">
                                    <div class="flex items-start">
                                        {/*<div class="flex items-center h-5">*/}
                                        {/*    <input id="remember" aria-describedby="remember" type="checkbox"*/}
                                        {/*           class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"*/}
                                        {/*           />*/}
                                        {/*</div>*/}
                                        {/*<div class="ml-3 text-sm">*/}
                                        {/*    <label htmlFor="remember" class="text-gray-500 dark:text-gray-300">Remember*/}
                                        {/*        me</label>*/}
                                        {/*</div>*/}
                                    </div>
                                    <a href="#"
                                       class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot
                                        password?</a>
                                </div>
                                <LoadingButton
                                    class="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                                    onClick={fetchLogin}
                                    loadingText=""
                                    >
                                    login
                                </LoadingButton>
                                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Don’t have an account yet? <A href={Routes.register}
                                                                  class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign
                                    up</A>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
)
}

export default UserLoginPage;