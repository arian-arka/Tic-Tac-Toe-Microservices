import Config from "../Config";

class Log {
    print(title: string|number|boolean, data: any, textColor: string) {
        if (!Config.debug)
            return;

        console.log(`%c ${title} `, ` color: ${textColor}`);
        console.log(data);
        console.log(`< == END == > `);
    }

    secondary(title: string|number|boolean, data: any){
        this.print(title,data,'#838181');
    }
    warning(title: string|number|boolean, data: any){
        this.print(title,data,'#e59052');
    }
    primary(title: string|number|boolean, data: any){
        this.print(title,data,'#3c81c5');
    }
    danger(title: string|number|boolean, data: any){
        this.print(title,data,'#e51616');
    }
    success(title: string|number|boolean, data: any){
        this.print(title,data,'#10c70a');
    }
    unknown(title: string|number|boolean, data: any){
        this.print(title,data,'#5f0ac7');
    }
    debug(title: string|number|boolean, data: any){
        this.print(title,data,'#f3db3d');
    }
}

export default new Log();