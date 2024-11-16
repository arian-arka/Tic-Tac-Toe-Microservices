import {Component} from 'solid-js';
import {Route, Routes} from "@solidjs/router";
import TestPage from "./Pages/TestPage";
import Layout from './Layout/Layout';
import 'flowbite';
import {useHelper} from "./Core/Helper";
import UserLoginPage from "./Pages/User/UserLoginPage";
import UserRegisterPage from "./Pages/User/UserRegisterPage";
import GameTicTacToePage from "./Pages/Game/GameTicTacToePage";
import GameTicTacToeResultPage from "./Pages/Game/GameTicTacToeResultPage";
import HomePage from "./Pages/HomePage";
import GameTicTacToeLobby from "./Pages/Game/GameTicTacToeLobby";
import ChatPrivate from "./Pages/Chat/ChatPrivate";
import FriendListPage from "./Pages/Friend/FriendListPage";
import FindFriendPage from "./Pages/Friend/FindFriendPage";
import FriendListRequestPage from "./Pages/Friend/FriendListRequestPage";
import GameHistoryPage from "./Pages/Game/GameHistoryPage";

const App: Component = () => {

    return (
        <>
            <Routes>
                <Route path="/" component={Layout}>
                    <Route path="/" component={HomePage}/>
                    <Route path="/login" component={UserLoginPage}/>
                    <Route path="/register" component={UserRegisterPage}/>
                    <Route path="/test" component={TestPage}/>
                    <Route path="/home" component={HomePage}/>
                    <Route path="/game">
                        <Route path="/history" component={GameHistoryPage}/>
                        <Route path="/tic-tac-toe/lobby" component={GameTicTacToeLobby}/>
                        <Route path="/tic-tac-toe/result" component={GameTicTacToeResultPage}/>
                        <Route path="/tic-tac-toe" component={GameTicTacToePage}/>
                    </Route>
                    <Route path="/friend">
                        <Route path="/list/requests" component={FriendListRequestPage}/>
                        <Route path="/list" component={FriendListPage}/>
                        <Route path="/find" component={FindFriendPage}/>
                    </Route>
                    <Route path="/chat">
                        <Route path="/private/:userId" component={ChatPrivate}/>
                    </Route>
                </Route>
            </Routes>
        </>
    );
};

export default App;
