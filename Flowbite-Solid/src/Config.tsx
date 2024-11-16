import {HelperInterface} from "./Core/Helper";
import Routes from "./Routes";

export default {
    'debug' : true,
    'defaultHeaders' : {
        "Accept": 'application/json'
    },
    'status' : {
        401: (helper:HelperInterface,data:{body:any,status:number,headers:any})=>{
            helper.route('login')
        },
        0: (helper:HelperInterface,data:{body:any,status:number,headers:any})=>{

        },
    },
    'csrf' :async () =>{
        try{
            const f = await fetch((new URL(Routes.csrf,Routes.getBase())).toString());
            const j = f.json();
            return {
                'headers' : {
                    'x-csrf-token' : j['token']
                }
            }
        }catch (e) {
            return false;
        }
    },
    'csrfError':() => {
        return 'csrf mismatch';
    },
    'allNotificationsRoute' : `notifications`,
    'toastTimeout' : 3500,
}