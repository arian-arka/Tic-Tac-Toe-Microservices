import Api, {ApiWithCsrf} from "../Core/Api";

export default class GameApi extends Api{

    accept(accept : boolean){
        return this.make<any>({
            url:`/game/accept/${accept ? 'true' : 'false'}`,
            method:'GET',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            // credentials:'include',
            data:{ },
        },'chat');
    }

    start(user : string|number){
        return this.make<any>({
            url:`/game/start/${user}`,
            method:'GET',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            // credentials:'include',
            data:{ },
        },'chat');
    }
    stats(){
        return this.make<any>({
            url:`/game/stats`,
            method:'POST',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            // credentials:'include',
            data:{ },
        },'chat');
    }
    list(data){
        return this.make<any>({
            url:`/game/list`,
            method:'POST',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            // credentials:'include',
            data,
        },'chat');
    }

}
