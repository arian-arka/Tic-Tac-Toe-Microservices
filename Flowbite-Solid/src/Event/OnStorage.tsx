import Log from "../Core/Log";
import {HelperInterface} from "../Core/Helper";
import Authenticated from "./Authenticated";

export default {
    isAuthenticated(oldVal : undefined|null|string, newVal: undefined|null|string,helper : HelperInterface){
        Log.debug('isAuthenticated storage',{oldVal,newVal,helper});
        Authenticated.trigger(newVal,helper);
    }
}