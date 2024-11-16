export interface ResponseInterface<dataSchema>{
    headers?:Headers,
    status : number,
    ok : boolean,
    data:dataSchema,
    isReal : boolean,
}
export default class Response<dataSchema> {
    public props : ResponseInterface<dataSchema>;
    constructor(props : ResponseInterface<dataSchema>) {this.props = props}
}
