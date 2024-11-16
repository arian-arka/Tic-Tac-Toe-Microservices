import Language from "../Language";

class Lang {
    protected locale: any;
    protected lang: string = 'en';

    constructor() {
        this.locale = Language;
    }

    setLang(lang: string) {
        this.lang = lang;
        return this;
    }

    get(key: string, ...args: any[]): string {
        let l = this.locale[this.lang];
        for (let k of key.split('.'))
            l = l[k];
        if (typeof l === 'function')
            return l(...args);
        return l;
    }
}

export default new Lang();