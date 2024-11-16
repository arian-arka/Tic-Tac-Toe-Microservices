import Config from "./Config";

export default {
    'localBase': 'http://127.0.0.1:8000',
    'base': 'http://127.0.0.1:8000',

    'localChatBase' : 'http://127.0.0.1:3000',
    'chatBase' : 'http://127.0.0.1:3000',

    getBase(service = '') {
        if(!(!!service))
            return Config.debug ? this.localBase : this.base;
        if(service === 'chat')
            return Config.debug ? this.localChatBase : this.chatBase;
    },
    'csrf': '/csrf',


    'login': '/login',
    'register': '/register',

    'game-history':'/game/history',
    'tictactoe':'/game/tic-tac-toe',
    'tictactoe-lobby':'/game/tic-tac-toe/lobby',
    'tictactoe-result':'/game/tic-tac-toe/result',


    'friend-list-requests' : '/friend/list/requests',
    'friend-list' : '/friend/list',
    'friend-find' : '/friend/find',

    'chat-private':'/chat/private',

    'home' : '/home',

    'notifications': '/notifications',

    'test': '/test',

};