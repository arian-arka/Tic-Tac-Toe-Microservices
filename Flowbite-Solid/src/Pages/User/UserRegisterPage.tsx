import {Component, createSignal} from "solid-js";
import TextInput from "../../Components/Input/TextInput";
import {useHelper} from "../../Core/Helper";
import LoadingButton from "../../Components/Button/LoadingButton";
import {useToast} from "../../Core/Toast";
import {A} from "@solidjs/router";
import Routes from "../../Routes";
import BigSingleFileInput from "../../Components/Input/BigSingleFileInput";
import UserApi from "../../Api/User.api";
import {Ok} from "../../Core/Response/Ok";
import {NetworkError} from "../../Core/Response/NetworkError";
import { BadRequest } from "../../Core/Response/BadRequest";
import Log from "../../Core/Log";

const UserRegisterPage: Component = () => {
    const helper = useHelper();
    const toast = useToast();
    helper.page.set('ShowDefaultAside', '0');
    const [data, setData] = createSignal<any>({}, {equals: false});
    const fetchRegister = async (setLoading) => {
        setLoading(true);
        const api = await (new UserApi(helper)).register(data());
        Log.debug('data',data());
        await api({
            ok(r: Ok<any>) {
                helper.route('login');
                toast.make('success',{props:['Account created. please login.']});
            },
            bad(r: BadRequest) {
                toast.firstError(r);
            },
            network(r: NetworkError) {
                Log.success('network',r.props);
            }
        });
        setLoading(false);
        // toast('danger', {
        //     props: ['asfds']
        // })
    }

    const setOneData = (key, val) => {
        const _ = data();
        _[key] = val;
        setData(_);
    }
    const setAvatar = async (f, setLoading) => {
        setOneData('avatar', f);
        return true;
    }
    return (
        <>
            <section class="bg-gray-50 dark:bg-gray-900">
                <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                        {/*<img class="w-8 h-8 mr-2"*/}
                        {/*     src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">*/}
                        {/*    Flowbite*/}
                    </a>
                    <div
                        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Create and account
                            </h1>
                            <form class="space-y-4 md:space-y-6" action="#">

                                <TextInput
                                    label="Name"
                                    type="text"
                                    floating={true}
                                    onChange={(val) => setOneData('name',val)}
                                />
                                <TextInput
                                    label="Username"
                                    type="text"
                                    floating={true}
                                    onChange={(val) => setOneData('username',val)}
                                />
                                <TextInput
                                    label="Email"
                                    floating={true}
                                    onChange={(val) => setOneData('email',val)}
                                />
                                <TextInput
                                    label="Password"
                                    type="password"
                                    floating={true}
                                    onChange={(val) => setOneData('password',val)}
                                />
                                <TextInput
                                    label="Confirm password"
                                    type="password"
                                    floating={true}
                                    onChange={(val) => setOneData('password',val)}
                                />
                                <div class="mb-6">
                                    <BigSingleFileInput
                                        onInput={setAvatar}
                                        maxSize={5_000_000}
                                        accept={['jpg', 'png', 'jpeg', 'svg']}
                                    />
                                </div>
                                <div class="flex items-start">
                                    <div class="flex items-center h-5">
                                        <input id="terms" aria-describedby="terms" type="checkbox"
                                               class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                                        />
                                    </div>
                                    <div class="ml-3 text-sm">
                                        <label class="font-light text-gray-500 dark:text-gray-300">I
                                            accept the <a
                                                class="font-medium text-primary-600 hover:underline dark:text-primary-500"
                                                href="#">Terms and Conditions</a></label>
                                    </div>
                                </div>
                                <LoadingButton
                                    class="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                                    onClick={fetchRegister}
                                    loadingText=""
                                >
                                    Register
                                </LoadingButton>
                                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Already have an account? <A href={Routes.login}
                                                                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login
                                    here</A>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default UserRegisterPage;