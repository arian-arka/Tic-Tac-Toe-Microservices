import Response from "./Response";

export interface BadRequestInterface {
    message?: string,
    errors?: {
        [key: string]: string
    }
}

export class BadRequest extends Response<BadRequestInterface> {
    static forClient(errors: { [key: string]: string }) {
        return BadRequest.errors(errors);
    }

    static errors(errors: { [key: string]: string }) {
        return new BadRequest({
            status: 400,
            isReal: false,
            ok: false,
            data: {
                errors
            }
        });
    }

    static message(message: string) {
        return new BadRequest({
            status: 400,
            isReal: false,
            ok: false,
            data: {
                message
            }
        });
    }

    firstError(ignoreKeys?: string[]) {
        if (ignoreKeys && ignoreKeys.length) {
            for (let k in this.props.data.errors ?? {}) {
                if (!ignoreKeys.includes(k)) { // @ts-ignore
                    return this.props.data.errors[k];
                }
            }
        }
        const vals = Object.values(this.props.data.errors ?? {});
        return vals.length === 0 ? '' : vals[0];
    }

    message() {
        return this.props.data.message;
    }
}
