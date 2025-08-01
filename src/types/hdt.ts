import { Model, Property } from "./property"

export interface HdtCreateResponse {
    id: string
    models: Array<Model>
}

/**
 * This interface encapsulates a response to a Status request from the WLDT HTTP adapter.
 */
export interface HdtStatusResponse {
  actions: Array<any>
  events: Array<any>
  properties: Array<PropertyResponse>
  relationships: Array<any>
}

export const emptyStatusResponse: () => HdtStatusResponse = () => {
  return {
    actions: [],
    events: [],
    properties: [],
    relationships: [],
  }
}

/**
 * This interface encapsulates a Property inside the response to a Status request from the WLDT HTTP adapter.
 */
export interface PropertyResponse {
  exposed: boolean
  key: string
  readable: boolean
  type: string
  value: Property
  writable: boolean
}