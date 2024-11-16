import {Component} from "solid-js";
import {Outlet} from "@solidjs/router";
import PersonalNav from "../Components/Nav/PersonalNav";
import DefaultAside from "../Components/Aside/DefaultAside";
import {useHelper} from "../Core/Helper";
import {ToastProvider} from "../Core/Toast";

const Layout: Component = () => {
    return (
        <>
            <ToastProvider>
                <PersonalNav/>
                <DefaultAside/>
                <Outlet/>
            </ToastProvider>
        </>
    );
}

export default Layout;

