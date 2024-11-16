import {Schema} from "yup";
import {NetworkError} from "./Response/NetworkError";
import {BadRequest, BadRequestInterface} from "./Response/BadRequest";
import Routes from "../Routes";
import Config from "../Config";
import {Ok} from "./Response/Ok";
import {InternalServerError} from "./Response/InternalServerError";
import {HelperInterface} from "./Helper";
import Log from "./Log";

export interface ValidationInterface {
    schema?: Schema,
    custom?: Function,
    disableCasting?: boolean,
}

export interface ApiProps<dataSchema> {
    url: string,
    method: 'GET' | 'get' | 'POST' | 'post' | 'PUT' | 'put' | 'delete' | 'DELETE',
    headers?: { [key: string]: string },
    data?: dataSchema,
    validation?: ValidationInterface,
    overwriteRequest?: { [key: string]: any },
    toFormData?: false|true,
    credentials?: 'same-origin' | 'include',
    status?: {
        [key: number | string]: (helper: HelperInterface) => void
    }
}

export class Request {

    static async validate(data: any, validation: ValidationInterface) {
        if (validation?.schema) {
            return validation.schema.validate(data).then(async () => {
                if (validation.custom) {
                    const errors = await validation.custom(data);
                    if (errors)
                        return {ok: false, response: BadRequest.forClient(errors)};
                    return {ok: true};
                }
            }).catch((e) => {
                return {
                    ok: false, response: BadRequest.forClient({
                        key: e.path,
                        message: 'params' in e ? e.message : e.message.substring(e.message.indexOf(e.path) + e.path.length).trim(),
                    })
                }
            })
        } else if (validation?.custom) {
            const errors = await validation.custom(data);
            if (errors)
                return {ok: false, response: BadRequest.forClient(errors)};
            return {ok: true};
        }
        return {ok: true};
    }

    static async fetch<schema>(helper:HelperInterface,url: string, options: RequestInit,statuses: {
        [key: number | string]: (helper: HelperInterface,data:{body:any,status:any,headers:any}) => void
    },onResponse : OnResponseInterface<any>) {
        Log.warning(`fetching ${url}`,options)
        try {

            const f = await fetch(url, options);
            const body = await f.json();
            const status = f.status;
            const headers = f.headers;

            Log.debug('response status',status);
            Log.debug('response json',body);
            Log.debug('response headers',headers);
            if(status === 200 || status === 201){
                if(status in statuses)
                    await statuses[status](helper,{body,status,headers});
                await onResponse?.ok(new Ok<any>({status,headers,ok:true,data:body,isReal:true}))
            }else if(status < 500 && status > 399){
                if(status in statuses)
                    await statuses[status](helper,{body,status,headers});
                await onResponse?.bad(new BadRequest({status,headers,ok:true,data:body,isReal:true}))
            }else if(status < 600 && status > 499){
                if(status in statuses)
                    await statuses[status](helper,{body,status,headers});
                await onResponse?.internal(new InternalServerError({status,headers,ok:true,data:body,isReal:true}))
            }

        } catch (e) {
            Log.debug('request catch e',e);
            await onResponse?.network(new NetworkError({status: 0, isReal: true, data: e as Error, ok: false,}))
        }
    }
}

export interface OnResponseInterface<schema> {
    ok?(r: Ok<schema>): void,

    bad?(r: BadRequest): void,

    internal?(r: InternalServerError): void,

    network?(r: NetworkError): void,
}

export default class Api {
    protected helper : HelperInterface;
    constructor(helper:HelperInterface) {
        this.helper=helper;
    }

    defaults(): {
        data?: any,
        credentials?: 'same-origin' | 'include',
        headers?: { [key: string]: string },
    } {
        return {}
    }

    status() {
        return Config.status;
    }

    async make<dataSchema>(props: ApiProps<dataSchema>,base = '', concatBase = true) {
        return  async (onResponse: OnResponseInterface<dataSchema>) => {
            const def = this.defaults();

            //validation
            const validation = await Request.validate(props.data, props?.validation ?? {});
            if (!validation.ok)
                return await onResponse?.bad(validation.response);
            //url
            const url = concatBase ? new URL(props.url, Routes.getBase(base)) : new URL(props.url);

            //type casting
            let tmpData = !!props.data ? props.data : {};
            tmpData = def?.data ? {...tmpData, ...def.data} : tmpData;
            const data = props?.validation?.disableCasting === true ? tmpData : (
                typeof props?.validation?.disableCasting === 'object' ? (() => {
                    const _ = {};
                    for (let key in tmpData)
                        if (key in props.validation?.disableCasting)
                            _[key] = tmpData[key];
                    return {...tmpData, ...props.validation?.schema?.cast(_)};
                })() : tmpData
            );

            //body conversion
            let body;
            if (props?.toFormData) {
                body = new FormData();
                for (let key in data)
                    body.set(key, data[key]);
                for (let _pair of body.entries()) {
                    Log.debug(_pair[0], _pair[1]);
                }
            } else if (props.method.toUpperCase() === 'GET') {
                for (let key in data)
                    url.searchParams.set(key, data[key]);
            } else body = JSON.stringify(data);
            return Request.fetch<dataSchema>(this.helper,url.toString(), {
                method: props.method.toUpperCase(),
                body: body,
                headers: new Headers({
                    ...props.toFormData ? {} : {"Content-Type": "application/json"},
                    ...Config.defaultHeaders,
                    ...def?.headers ?? {},
                    ...props.headers,
                }),
                credentials: props?.credentials ? props.credentials : (def?.credentials ?? 'same-origin'),
                ...props?.overwriteRequest ?? {}
            }, {...this.status(),...props?.status ?? {}},onResponse);
        }
    }

}

export class ApiWithCsrf extends Api {
    async csrf(){
        return null;
    }

    async make<dataSchema>(props: ApiProps<dataSchema>,base='', concatBase: boolean = true) {
        if(props.method.toUpperCase() === 'GET')
            return super.make(props, base,concatBase);

        const p = {...props};
        let c = await this.csrf();
        if (c === null)
            c = await Config.csrf();

        if(c === false)
            return  async (onResponse: OnResponseInterface<dataSchema>) => {
                return await onResponse?.bad(BadRequest.message(Config.csrfError()));
            }

        p.headers={...p.headers,...c?.headers ?? {} };

        if(typeof  p.data === 'object')
            p.data={...p.data,...c?.data ?? {} };
        else
            p.data=c?.data ?? {}

        return super.make(p, base,concatBase);
    }
}
