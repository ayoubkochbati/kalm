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

import { V1LabelSelector } from './v1LabelSelector';

/**
* Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running
*/
export class V1PodAffinityTerm {
    'labelSelector'?: V1LabelSelector;
    /**
    * namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means \"this pod\'s namespace\"
    */
    'namespaces'?: Array<string>;
    /**
    * This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.
    */
    'topologyKey': string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "labelSelector",
            "baseName": "labelSelector",
            "type": "V1LabelSelector"
        },
        {
            "name": "namespaces",
            "baseName": "namespaces",
            "type": "Array<string>"
        },
        {
            "name": "topologyKey",
            "baseName": "topologyKey",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return V1PodAffinityTerm.attributeTypeMap;
    }
}

