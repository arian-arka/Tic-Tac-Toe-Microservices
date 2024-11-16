import {Component, createSignal} from "solid-js";
import {useToast} from "../Core/Toast";
import {useHelper} from "../Core/Helper";
import Log from "../Core/Log";

const TestPage: Component = () => {
    const toast = useToast();
    const helper = useHelper();
    const [connected, setConnected] = createSignal(0);
    const socket = new WebSocket(
        "ws://127.0.0.1:3000/message/socket",
    );

    const sendMessage = (data: any) => {
        if (!connected()) {
            console.log('trying to send message. but its disconnected');
            return;
        }
        const strData = JSON.stringify({...data, token: helper.storage.get('token')});
        console.log('sending data',strData);
        socket.send(strData);
    }
    socket.onopen = function (e) {
        console.log('opend', socket.OPEN);
        setConnected(socket.OPEN);
        sendMessage({
            'data': {
                'msg': 'hello'
            }
        });
    }
    socket.onmessage = function (e) {
        console.log('on message:', e.data.toString())
        const data: any = JSON.parse(e.data.toString());
    }
    socket.onclose = function (e){
        setConnected(0);
    }
    /* socket.connect();
     socket.on("connect", () =>  Log.success('Socket connected',socket.connected));
     socket.on("data", () => { /!* ... *!/ });
     // socket.emit("hello", "hi");
     //
     // socket.on("hey", (...args) => {
     //     Log.primary('hey',)
     // });*/
    return (
        <>
        </>
    );
}
export default TestPage;