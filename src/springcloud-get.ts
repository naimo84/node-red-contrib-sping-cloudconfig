
import { NodeMessageInFlow, NodeMessage } from "node-red";
import { getConfig } from "./helper";
const client = require("cloud-config-client");


function deepen(obj) {
    const result = {};

    // For each object path (property key) in the object
    for (const objectPath in obj) {
        // Split path into component parts
        const parts = objectPath.split('.');

        // Create sub-objects along path as needed
        let target = result;
        while (parts.length > 1) {
            const part = parts.shift();
            target = target[part] = target[part] || {};
        }

        // Set value at end of path
        target[parts[0]] = obj[objectPath]
    }

    return result;
}

module.exports = function (RED: any) {

    function eventsNode(config: any) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.application = config.application || 'default'
        try {

            node.msg = {};
            node.on('input', (msg, send, done) => {
                node.msg = RED.util.cloneMessage(msg);
                send = send || function () { node.send.apply(node, arguments) }

                cronCheckJob(node, msg, send, done, config.confignode);
            });

        }
        catch (err) {
            node.error('Error: ' + err.message);
            node.status({ fill: "red", shape: "ring", text: err.message })
        }
    }

    function cronCheckJob(node, msg: NodeMessageInFlow, send: (msg: NodeMessage | NodeMessage[]) => void, done: (err?: Error) => void, config) {
        let cloudConfig = getConfig(RED.nodes.getNode(config), config, msg)
        client.load({
            endpoint: cloudConfig.endpoint,
            headers: {
                'X-Config-Token': cloudConfig.configtoken
            },
            profiles: ['dev'],
            name: cloudConfig.application,
            label: cloudConfig.label
        })
            .then((config) => {
                send([Object.assign(msg, {
                    payload: deepen(config.properties)
                })]);
                if (done)
                    done();


            })
    }





    RED.nodes.registerType("springcloud-get", eventsNode);
}