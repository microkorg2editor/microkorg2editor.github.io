'use strict';

let midiIn = [];
let midiOut = [];
let notesOn = new Map(); 
let mParameterData = [];
let mNrpnData = [];
let mTimbre1Channel = 0;
let mTimbre2Channel = 1;
let mNumCCTimbreParams;
let mNumNrpnTimbreParams;

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
        input.addEventListener('midimessage', midiMessageReceived);
    }
}

function sendMidiCC(Channel, CCNumber, value) 
{    
    const StatusByte = 0xB0 | Number(Channel);

    const device = midiOut[selectOut.selectedIndex];
    const msg = [StatusByte, CCNumber, value];
    if(device)
    {
        device.send(msg); 
    }
}

function midiMessageReceived(event)
{    
    const statusByte = event.data[0];
    const dataByte1 = event.data[1];
    const dataByte2 = (event.data.length > 2) ? event.data[2] : 1;

    if(statusByte == 0xF8) return;

    switch(statusByte & 0xF0)
    {
        // CC
        case 0xB0:
        {
            break;
        }
        
        default:
            break;
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

function addSlider(id, min, max, row)
{
    var slider = document.createElement("input");
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.id = id;

    const sliderCell = row.insertCell();
    sliderCell.appendChild(slider);

    return slider;
}

function addTextBox(id, min, max, row, initValue)
{
    var textbox = document.createElement("input");
    textbox.type = 'text';
    textbox.id = id;
    textbox.value = initValue;
    const valueLabelCell = row.insertCell();
    valueLabelCell.appendChild(textbox);

    return textbox;
}

function addParametersToTable(tbl, parameterData, timbrePrefix)
{
    var parameters = parameterData.CCParameters;
    for (let i = 0; i < parameters.length; i++) 
    {
      const row = tbl.insertRow();
      const cell = row.insertCell();
      cell.innerHTML = timbrePrefix + parameters[i].name;
      mParameterData.push(parameters[i]);

      var slider = addSlider(mNumCCTimbreParams + i, 0, 127, row);
      slider.oninput = function() 
      {
        // TODO : channel support
        var timbre = this.id > mNumCCTimbreParams ? mTimbre2Channel : mTimbre1Channel;
        sliderChange(timbre, mParameterData[this.id].CC, this.value);
        var table = document.getElementById('parameterTable');
        var element = table.getElementsByTagName("tr");
        var td = element[this.id].getElementsByTagName("td");
        td[2].firstChild.value = this.value;
      }
      
      var textBox = addTextBox(mNumCCTimbreParams + i, 0, 127, row, slider.value);
      textBox.oninput = function() 
      {
          var timbre = this.id > mNumCCTimbreParams ? mTimbre2Channel : mTimbre1Channel;
          programChangeSliderChange(timbre, this.value);
          var table = document.getElementById('parameterTable');
          var element = table.getElementsByTagName("tr");
          var td = element[this.id].getElementsByTagName("td");
          td[1].firstChild.value = this.value;
      }
    }

    // NRPN params need special handling
    var nrpnParameters = parameterData.NrpnParmeters;
    for (let i = 0; i < nrpnParameters.length; i++) 
    {
        const row = tbl.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = timbrePrefix + nrpnParameters[i].name;
        mNrpnData.push(nrpnParameters[i]);

        var slider = addSlider(mNumNrpnTimbreParams + i, nrpnParameters[i].knobMin, nrpnParameters[i].knobMax, row);
        slider.oninput = function() 
        {
            var timbre = this.id > mNumNrpnTimbreParams ? mTimbre2Channel : mTimbre1Channel;
            nrpnSliderChange(timbre, mNrpnData[this.id].msb, mNrpnData[this.id].lsb, this.value);
            var table = document.getElementById('parameterTable');
            var element = table.getElementsByTagName("tr");
            var td = element[mParameterData.length + Number(this.id)].getElementsByTagName("td");
            td[2].firstChild.value = this.value;
        }
        
        var textBox = addTextBox(mNumNrpnTimbreParams + i, nrpnParameters[i].knobMin, nrpnParameters[i].knobMax, row, slider.value);
        textBox.oninput = function() 
        {
            var timbre = this.id > mNumNrpnTimbreParams ? mTimbre2Channel : mTimbre1Channel;
            programChangeSliderChange(timbre, this.value);
            var table = document.getElementById('parameterTable');
            var element = table.getElementsByTagName("tr");
            var td = element[mParameterData.length + Number(this.id)].getElementsByTagName("td");
            td[1].firstChild.value = this.value;
        }
    }
}

function createTable(data) 
{
    const body = document.body, 
    tbl = document.getElementById('parameterTable');
    tbl.style.width = body.width;
  
    if(data)
    {
        var parameterData = JSON.parse(data);

        // initialize
        mNumCCTimbreParams = 0;
        mNumNrpnTimbreParams = 0;
        addParametersToTable(tbl, parameterData, "Timbre 1 ");

        // set 
        mNumCCTimbreParams = mParameterData.length;
        mNumNrpnTimbreParams = mNrpnData.length;
        addParametersToTable(tbl, parameterData, "Timbre 2 ");

        var programChange = parameterData.ProgramChange;
        {
            const row = tbl.insertRow();
            const cell = row.insertCell();
            cell.innerHTML = programChange[0].name;
    
            var slider = addSlider(0, programChange[0].knobMin, programChange[0].knobMax, row);
            slider.oninput = function() 
            {
                programChangeSliderChange(0x0, this.value);
                var table = document.getElementById('parameterTable');
                var element = table.getElementsByTagName("tr");
                var td = element[mParameterData.length + nrpnParameters.length + Number(this.id)].getElementsByTagName("td");
                td[2].firstChild.value = this.value;
            }
    
            var textBox = addTextBox(0, programChange[0].knobMin, programChange[0].knobMax, row, slider.value);
            textBox.oninput = function() 
            {
                programChangeSliderChange(0x0, this.value);
                var table = document.getElementById('parameterTable');
                var element = table.getElementsByTagName("tr");
                var td = element[mParameterData.length + nrpnParameters.length + Number(this.id)].getElementsByTagName("td");
                td[1].firstChild.value = this.value;
            }
        }

        body.appendChild(tbl);
    }
}

function searchParameterTable() 
{
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("parameterSearchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("parameterTable");
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) 
    {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) 
      {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) 
        {
          tr[i].style.display = "";
        } 
        else 
        {
          tr[i].style.display = "none";
        }
      }
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

function setTimbre1Channel()
{
    mTimbre1Channel = T1Channel.value - 1;
}

function setTimbre2Channel()
{
    mTimbre2Channel = T2Channel.value - 1;
}

// // Select your input type file and store it in a variable
// const input = document.getElementById('fileinput');

// // This will upload the file after having read it
// const upload = (file) => 
// {
//   fetch('http://www.example.net', 
//   { // Your POST endpoint
//     method: 'POST',
//     headers:
//     {
//       // Content-Type may need to be completely **omitted**
//       // or you may need something
//       "Content-Type": "You will perhaps need to define a content-type here"
//     },
//     body: file // This is your file object
//   }).then(
//     response => response.json() // if the response is a JSON object
//   ).then(
//     success => console.log(success) // Handle the success response object
//   ).catch(
//     error => console.log(error) // Handle the error response object
//   );
// };

// // Event handler executed when a file is selected
// const onSelectFile = () => upload(input.files[0]);

// // Add a listener on your input
// // It will be triggered when a file will be selected
// input.addEventListener('change', onSelectFile, false);