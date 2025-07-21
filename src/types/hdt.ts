export interface HdtCreateResponse {
    id: string
    models: Array<Model>
}

export interface Model {
    properties: Array<Property>
}

export interface Property {
    name: string
    internalName: string
    description: string
    id: string
    type: string
}