declare namespace WebMidi {
    interface MIDIAccess {
        inputs: MIDIInputMap;
        outputs: MIDIOutputMap;
    }
    interface MIDIInputMap {
        values(): IterableIterator<MIDIInput>;
    }
    interface MIDIOutputMap {
        values(): IterableIterator<MIDIOutput>;
    }
    interface MIDIInput {
        manufacturer: string;
        name: string;
        onmidimessage: (message: MIDIMessageEvent) => void;
    }
    interface MIDIOutput {
        manufacturer: string;
        name: string;
        send: (data: number[] | Uint8Array) => void;
    }
    interface MIDIMessageEvent {
        data: Uint8Array;
    }
}

import type { useParameterStore } from '@/stores/parameters'

const VENDOR_ID = 0x42;
const PRODUCT_ID_MSB = 0x01;
const PRODUCT_ID_LSB = 0x71;

export class microKORG2MidiAccessor {
    private midiAccess_: WebMidi.MIDIAccess | null;
    private midiIn_: WebMidi.MIDIInput | null;
    private midiOut_: WebMidi.MIDIOutput | null;
    private parameterStore: ReturnType<typeof useParameterStore>;

    constructor(parameterStore: ReturnType<typeof useParameterStore>) {
        this.midiAccess_ = null;
        this.midiIn_ = null;
        this.midiOut_ = null;
        this.parameterStore = parameterStore;
    }

    initMIDI() {
        this.midiAccess_ = null;
        navigator.requestMIDIAccess({ sysex: true }).then(((midiAccess) => {
            if (midiAccess == null) {
                console.log("Couldn't get MIDI access")
                return;
            } else {
                this.midiAccess_ = midiAccess;

                let input_itr = midiAccess.inputs.values();
                for (let o = input_itr.next(); !o.done; o = input_itr.next()) {
                    let midiIn = o.value;
                    if (midiIn["manufacturer"] == "Korg Inc.") {
                        if (midiIn["name"] == "microKORG2 KEYBOARD") {
                            this.midiIn_ = midiIn;
                            this.midiIn_.onmidimessage = this.processMIDIMessage.bind(this);
                            break;
                        }
                    }
                }

                let output_itr = midiAccess.outputs.values();
                for (let o = output_itr.next(); !o.done; o = output_itr.next()) {
                    let midiOut = o.value;
                    if (midiOut["manufacturer"] == "Korg Inc." && midiOut["name"] == "microKORG2 SOUND") {
                        this.midiOut_ = midiOut;
                        this.sendProgramDataDumpRequest();
                        break;
                    }
                }
            }
        }));
    }

    sendMIDIMessage(message) {
        if (this.midiOut_ == null) throw ("microKORG2 isn't detected.");
        this.midiOut_.send(message);
    }

    sendProgramDataDumpRequest() {
        if (this.midiOut_ == null) throw ("microKORG2 isn't detected.");
        this.midiOut_.send([0xF0, VENDOR_ID, 0x30, 0x00, PRODUCT_ID_MSB, PRODUCT_ID_LSB, 0x10, 0xF7]);
    }

    processMIDIMessage(message: WebMidi.MIDIMessageEvent) {
        if (message.data.length == 1 && message.data[0] == 0xF8) {
            // Timing Clock
        } else if (this.isProgramDataDump(message.data)) {
            // remove sysex header and set values to store
            this.parameterStore.setValueFromDump(
                message.data.subarray(7, message.data.length - 7)
            );
        } else if (this.isNoteEvent(message.data)) {
            //console.log("Note Message");
        } else if ((message.data[0] & 0xF0) == 0xB0) {
            // CC
        } else {
            console.log(message);
        }
    }

    isProgramDataDump(data) {
        return (data.length >= 7 && data[0] == 0xF0 && data[1] == 0x42 /*&& data[2] == 0x3g */ && data[3] == 0x00 && data[4] == PRODUCT_ID_MSB && data[5] == PRODUCT_ID_LSB && data[6] == 0x40);
    }

    isNoteEvent(data) {
        return (data.length == 3 && (((data[0] & 0xf0) == 0x80) || (data[0] & 0xf0) == 0x90));
    }

    sendControlChange(cc: number, value: number, channel: number = 0) {
        if (this.midiOut_ == null) throw ("microKORG2 isn't detected.");
        const ch = (channel) & 0x0F;
        this.midiOut_.send([0xB0 | ch, cc, value]);
    }

    sendNRPN(msb: number, lsb: number, value: number, channel: number = 1) {
        if (this.midiOut_ == null) throw ("microKORG2 isn't detected.");
        const ch = (channel) & 0x0F;
        this.midiOut_.send([0xB0 | ch, 99, msb]);
        this.midiOut_.send([0xB0 | ch, 98, lsb]);
        this.midiOut_.send([0xB0 | ch, 6, value]);
    }
}