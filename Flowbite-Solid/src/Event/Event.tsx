import {HelperInterface} from "../Core/Helper";

export default class Event<T>{
    protected props : T;
    constructor(props : T) {
        this.props = props
    }

    dispatch(helper : HelperInterface){

    }

    static trigger(data : any,helper:HelperInterface){
        (new this(data)).dispatch(helper);
    }
}