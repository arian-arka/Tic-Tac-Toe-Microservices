import Response from "./Response";

export class NetworkError extends Response<Error> {
    message() {
        return this.props.data.message;
    }

    stack() {
        return this.props.data.stack;
    }

    name() {
        return this.props.data.name;
    }

}