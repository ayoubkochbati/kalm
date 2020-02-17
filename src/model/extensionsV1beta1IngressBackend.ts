/**
 * Kubernetes
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1.15.5
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
* IngressBackend describes all endpoints for a given service and port.
*/
export class ExtensionsV1beta1IngressBackend {
    /**
    * Specifies the name of the referenced service.
    */
    'serviceName': string;
    /**
    * Specifies the port of the referenced service.
    */
    'servicePort': object;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "serviceName",
            "baseName": "serviceName",
            "type": "string"
        },
        {
            "name": "servicePort",
            "baseName": "servicePort",
            "type": "object"
        }    ];

    static getAttributeTypeMap() {
        return ExtensionsV1beta1IngressBackend.attributeTypeMap;
    }
}

