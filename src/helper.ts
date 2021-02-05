
import { Node } from 'node-red';


export interface IcalNode extends Node {

    config: any;
    red: any;

}




export function getConfig(config: any, node?: any, msg?: any): any {


    const cloudConfig = {     
        name: msg?.name || config?.name,
        endpoint: config?.endpoint,
        profiles: [config?.profiles|| 'dev'] ,
        label: config?.label || 'master',
        pass: config?.credentials?.pass,
        user: config?.credentials?.user,
        configtoken: config?.credentials?.configtoken,
        application: node?.application
    } as any;

    return cloudConfig;
}





