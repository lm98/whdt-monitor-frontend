export interface Model {
    properties: Array<Property>
}

export interface Property {
  name: string;
  id: string;
  description: string;
  valueMap: Record<string, PropertyValue>;
}

/**
 * Represent the possible values a property can possess.
 */
type PropertyValue =
  | { type: "empty-value"; value: null }
  | { type: "string-value"; value: string }
  | { type: "int-value"; value: number }
  | { type: "float-value"; value: number }
  | { type: "boolean-value"; value: boolean }
  | { type: "double-value"; value: number }
  | { type: "long-value"; value: number };
