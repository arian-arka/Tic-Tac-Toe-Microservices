import { HelperInterface } from "../Core/Helper";
import Event from "./Event";

export default class Authenticated extends Event<string>{
    dispatch(helper: HelperInterface) {
        if(this.props !== '1')
            helper.route('login');
        // else
        //     helper.route('home');
    }
}