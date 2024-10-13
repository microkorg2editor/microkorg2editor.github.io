'use strict';

export { connect, loadJSON, sendMidiCC, sliderChange, createTable, midiIn, midiOut, notesOn, mParameterData };

let midiIn = [];
let midiOut = [];
let notesOn = new Map(); 
let mParameterData = [];
let mNrpnData = [];

connect();
loadJSON("https://raw.githubusercontent.com/microkorg2editor/microkorg2editor.github.io/main/parameterList.json");

function connect() 
{
    if(navigator.requestMIDIAccess)
    {
        console.log('This browser supports WebMIDI!');
    } 
    else 
    {
        console.log('WebMIDI is not supported in this browser.');
    }

    navigator.requestMIDIAccess().then(midiSuccess, midiFailure);
}
  
function midiSuccess(midi) 
{
    console.log('midiSuccess');
    midi.addEventListener('statechange', (event) => initDevices(event.target));
    initDevices(midi); // see the next section!
}

function midiFailure()
{
    console.log('Could not access your MIDI devices.');  
}

function initDevices(midi)
{
    // Reset.
    midiIn = [];
    midiOut = [];

    // MIDI devices that send you data.
    const inputs = midi.inputs.values();
    for(let input = inputs.next(); input && !input.done; input = inputs.next()) 
    {
        midiIn.push(input.value);
    }

    if(midiIn.length === 0)
    {
        console.log('No MIDI input devices.');  
    }

    // MIDI devices that you send data to.
    const outputs = midi.outputs.values();
    for(let output = outputs.next(); output && !output.done; output = outputs.next()) 
    {
        midiOut.push(output.value);
    }

    if(midiOut.length === 0)
    {
        console.log('No MIDI output devices.');  
    }    

    displayDevices();
    startListening();
}
  
function displayDevices() 
{
    selectIn.innerHTML = midiIn.map(device => `<option>${device.name}</option>`).join('');
    selectOut.innerHTML = midiOut.map(device => `<option>${device.name}</option>`).join('');
}  

// Start listening to MIDI messages.
function startListening() 
{
    for (const input of midiIn) 
    {
        // input.addEventListener('midimessage', midiMessageReceived);
    }
}

function sendMidiCC(Channel, CCNumber, value) 
{    
    console.log(Channel, CCNumber, value);
    const StatusByte = 0xB0 | Channel;

    const device = midiOut[selectOut.selectedIndex];
    const msgOn = [StatusByte, CCNumber, value];
    
    // First send the note on;
    if(device)
    {
        device.send(msgOn); 
    }
}

function sliderChange(channel, CC, value) 
{
    sendMidiCC(channel, CC, value);
}

function nrpnSliderChange(channel, msb, lsb, value)
{
    // set NRPN
    sendMidiCC(channel, 98, lsb);
    sendMidiCC(channel, 99, msb);

    // data entry
    lsb = value & 0x7F;
    sendMidiCC(channel, 38, lsb);
    msb = (value < 0) ? 0x7F : 0x0;
    sendMidiCC(channel, 6, msb);
}

function createTable(data) 
{
    const body = document.body, 
    tbl = document.createElement('table');
    tbl.style.width = body.width;
  
    if(data)
    {
        var parameterData = JSON.parse(data);
        var parameters = parameterData.CCParameters;
        for (let i = 0; i < parameters.length; i++) 
        {
          const row = tbl.insertRow();
          const cell = row.insertCell();
          cell.innerHTML = parameters[i].name;
          mParameterData.push(parameters[i]);

          var slider = document.createElement("input");
          slider.type = 'range';
          slider.min = 0;
          slider.max = 127;
          slider.id = i;
          slider.oninput = function() 
          {
            // TODO : channel support
            sliderChange(0x0, mParameterData[this.id].CC, this.value);
          }
          cell.appendChild(slider);
        }

        // NRPN params need special handling
        var nrpnParameters = parameterData.NrpnParmeters;
        for (let i = 0; i < nrpnParameters.length; i++) 
        {
            const row = tbl.insertRow();
            const cell = row.insertCell();
            cell.innerHTML = nrpnParameters[i].name;
            mNrpnData.push(nrpnParameters[i]);

            var slider = document.createElement("input");
            slider.type = 'range';
            slider.min = nrpnParameters.knobMin;
            slider.max = nrpnParameters.knobMax;
            slider.id = i;
            slider.oninput = function() 
            {
                // TODO : channel support
                nrpnSliderChange(0x0, mNrpnData[this.id].msb, mNrpnData[this.id].lsb, this.value);
            }
            cell.appendChild(slider);
        }
        body.appendChild(tbl);
    }
}

function loadJSON(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() 
    {
        if (rawFile.readyState === 4 && rawFile.status == "200") 
        {
            createTable(rawFile.responseText);
        }
    }
    rawFile.send(null);
}