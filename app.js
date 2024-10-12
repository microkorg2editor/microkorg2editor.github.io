'use strict';

let midiIn = [];
let midiOut = [];
let notesOn = new Map(); 

connect();
loadXMLDoc("https://raw.githubusercontent.com/microkorg2editor/microkorg2editor.github.io/main/parameterList.xml");

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
        input.addEventListener('midimessage', midiMessageReceived);
    }
}

function sendMidiCC(Channel, CCNumber, value) 
{    
    const StatusByte = 0xB0 | Channel;

    const device = midiOut[selectOut.selectedIndex];
    const msgOn = [StatusByte, CCNumber, value];
    
    // First send the note on;
    device.send(msgOn); 
}

function sliderChange(val) 
{
    sendMidiCC(0x0, 0x7, val);
}

function createTable(xmlDocument) 
{
    const body = document.body, 
    tbl = document.createElement('table');
    tbl.style.width = body.width;
  
    if(xmlDocument)
    {
        var parser = new DOMParser();
        var parameterXml = parser.parseFromString(xmlDocument, "application/xml");
        var x = parameterXml.getElementsByTagName("parameter");
        for (let i = 0; i < x.length; i++) 
        {
          const row = tbl.insertRow();
          const cell = row.insertCell();
          cell.innerHTML = x[i].getElementsByTagName("name");
        }
        body.appendChild(tbl);
    }
}

function loadXMLDoc(filename) 
{ 
    const xhttp = new XMLHttpRequest(); 
    xhttp.onreadystatechange = function()
    { 
        console.log(this.readyState); 
        console.log(this.status); 

        if (this.readyState === 4 && this.status === 200) 
        { 
            const xmlDoc = this.responseText; 
            // Process the XML data here 
            createTable(xmlDoc);
        } 
    }; 
    xhttp.open("GET", filename, true); 
    xhttp.send(); 
}