import Api, {ApiWithCsrf} from "../Core/Api";

export default class UserApi extends Api{
    register(data :any){
        return this.make<any>({
            url:`/api/register`,
            method:'POST',
            toFormData:true,
            headers:{

            },
            credentials:'include',
            data,
        })
    }

    login(data :any){
        return this.make<any>({
            url:`/api/login`,
            method:'POST',
            headers:{},
            credentials:'include',
            data,
        })
    }
    requestFriend(id : string|number){
        return this.make<any>({
            url:`/api/friend/request/${id}`,
            method:'POST',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
    acceptFriend(id : string|number,accept:boolean){
        return this.make<any>({
            url:`/api/friend/request/${id}/${accept ? 'accept' : 'decline'}`,
            method:'POST',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }

    removeFriend(id : string|number){
        return this.make<any>({
            url:`/api/friend/remove/${id}`,
            method:'DELETE',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
    listFriendRequests(){
        return this.make<any>({
            url:`/api/friend/list/requests`,
            method:'GET',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
    listFriends(){
        return this.make<any>({
            url:`/api/friend/list`,
            method:'GET',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
    friendWith(id:string|number){
        return this.make<any>({
            url:`/api/friend/with/${id}`,
            method:'GET',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
    findFriend(username : string){
        return this.make<any>({
            url:`/api/friend/find`,
            method:'POST',
            headers:{
                "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{username},
        })
    }

    profile(userId:string|number){
        return this.make<any>({
            url:`/api/user/${userId}`,
            method:'GET',
            headers:{
                // "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
    random(){
        return this.make<any>({
            url:`/api/user/random`,
            method:'GET',
            headers:{
                 "Authorization": `Bearer ${this.helper.storage.get('token','')}`,
            },
            credentials:'include',
            data:{},
        })
    }
}
