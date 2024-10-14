'use strict';

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
    const StatusByte = 0xB0 | Channel;

    const device = midiOut[selectOut.selectedIndex];
    const msg = [StatusByte, CCNumber, value];
    if(device)
    {
        device.send(msg); 
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
    sendMidiCC(channel, 6, (value < 0) ? 0x7F : 0x0);
    sendMidiCC(channel, 38, value & 0x7F);
}

function programChangeSliderChange(channel, value)
{
    var bank = Math.floor(value / 64);
    var prog = value % 64;

    sendMidiCC(channel, 32, bank);

    const device = midiOut[selectOut.selectedIndex];
    const msg = [(0xC0 | channel), prog];
    if(device)
    {
        device.send(msg); 
    }
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
            slider.min = nrpnParameters[i].knobMin;
            slider.max = nrpnParameters[i].knobMax;
            slider.id = i;
            slider.oninput = function() 
            {
                // TODO : channel support
                nrpnSliderChange(0x0, mNrpnData[this.id].msb, mNrpnData[this.id].lsb, this.value);
            }
            cell.appendChild(slider);
        }

        var programChange = parameterData.ProgramChange;
        {
            const row = tbl.insertRow();
            const cell = row.insertCell();
            cell.innerHTML = programChange[0].name;

            var slider = document.createElement("input");
            slider.type = 'range';
            slider.min = programChange[0].knobMin;
            slider.max = programChange[0].knobMax;
            slider.id = 0;
            slider.oninput = function() 
            {
                // TODO : channel support
                programChangeSliderChange(0x0, this.value);
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