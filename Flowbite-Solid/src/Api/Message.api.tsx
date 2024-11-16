import Api, {ApiWithCsrf} from "../Core/Api";

export default class MessageApi extends Api{

    list(createdAt : string|number,userId){
        return this.make<any>({
            url:`/message/list`,
            method:'POST',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            // credentials:'include',
            data:{createdAt,dst:userId},
        },'chat');
    }

}
