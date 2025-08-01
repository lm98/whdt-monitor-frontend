export interface Model {
    properties: Array<Property>
}

export interface Property {
    name: string
    internalName: string
    description: string
    id: string
    type: string
    timestamp: number | undefined
}

export interface HeartRate extends Property {
    type: "HeartRate"
    bpm: number
    timestamp: number
}

export interface BloodPressure extends Property {
    type: "BloodPressure"
    systolic: number
    diastolic: number
    timestamp: number
}
