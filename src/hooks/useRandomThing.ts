import EventEmitter from 'eventemitter3';
import { useContext, createContext } from 'react';


export class RandomThing extends EventEmitter {
    value: number = 0;

    getValue() {
        return this.value;
    }

    setValue(value: number): this {
        this.value = value;
        return this;
    }
}

export const RandomThingContext = createContext<RandomThing>({} as RandomThing);

export function useRandomThing() {
    return useContext(RandomThingContext);
}