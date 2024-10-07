let uploadedFileName = "edited_data.json";
let SelectedData = null;

window.onload = function () {
    document.getElementById("file-input").addEventListener('change', LoadData);
    document.getElementById("save-json").addEventListener('click', SaveData);

    document.getElementById('load-json').addEventListener('click', () => {
            document.getElementById('file-input').click();
    });
    for(let i = 0; i < 6; i++){
        document.getElementById("typeselector-dialog").children[1].children[i].addEventListener("click", () =>{ SelectType(document.getElementById("typeselector-dialog").children[1].children[i].textContent)});
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("source") !== null){
        document.getElementById('file-info').textContent = "Please wait for the API to respond. This may take a few seconds.";
        GetDataFromURL(urlParams.get("source"));
    }
};

function GetDataFromURL(url){
    fetch(url)
  .then(response => response.json())
  .then(data => {
    uploadedFileName = "file.json";
    document.getElementById('file-info').textContent = "API response";
    DisplayData(data, document.getElementById("table-container"), false);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

function LoadData(fileselectevent){
    const file = fileselectevent.target.files[0];
    if (file && file.type === 'application/json') {
        uploadedFileName = file.name; // Save the uploaded file name
        document.getElementById('file-info').textContent = file.name; // Display the file name

        const reader = new FileReader();

        reader.onload = function(e) {
                let jsonData = JSON.parse(e.target.result);
                
                const container = document.getElementById('table-container');
                container.innerHTML = '';
                DisplayData(jsonData, container, false);
        };

        reader.readAsText(file);
    } else {
        alert('Please select a valid JSON file.');
    }
}

function SaveData(){
    data = ExtractData(document.getElementById('table-container').children[1]);
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedFileName; // Use the original file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("File saved successfully.");
}

function DisplayData(data, container, iskey){
    let value;
    
    if (iskey){
        value = document.createElement("TEXTAREA");
        value.className = "textfield";
        value.value = data
        value.rows = 1;
        container.appendChild(value);
        return;
    }
    
    const typeselector = document.createElement("div");
    typeselector.className = "typeselector";
    typeselector.addEventListener('click', () => OpenTypeselectorDialog(typeselector.parentElement));
    
    container.appendChild(typeselector);
    
    
    if (typeof data === "string"){
        typeselector.textContent = "abc";
        
        value = document.createElement("TEXTAREA");
        value.className = "textfield";
        value.value = data
        
    }
    else if (typeof data === "number"){
        typeselector.textContent = "123";
        value = document.createElement("TEXTAREA");
        
        value.className = "textfield";
        value.value = data.toString();
        value.addEventListener("change", function(){
            console.log("hum");
            if(this.value.trim() && isNaN(Number(this.value.trim()))){
                window.alert("The number you have input is invalid.\nPlease input a valid number, or the number will be converted to text when saving.");
            }
        })
    }
    else if (typeof data === "boolean"){
        typeselector.textContent = "t/f";
        value = document.createElement("div");
        if (data === true) value.className = "bool booltrue";
        else value.className = "bool boolfalse";
        value.textContent = data.toString();
        value.addEventListener("click", () => ToggleBool(value))
    }
    else if (data === null){
        typeselector.textContent = "null";
        value = document.createElement("div");
    }
    else if (Array.isArray(data)){
        typeselector.textContent = "[#]";
        value = document.createElement("TABLE");
        value.className = "table";
        data.forEach(element => {
            row = document.createElement("TR");
            row.className = "tr";
            tada = document.createElement("TD");
            row.appendChild(tada);
            value.appendChild(row);
            DisplayData(element, tada, false);
        });
    }
    else if (typeof data === "object"){
        typeselector.textContent = "{#}";
        value = document.createElement("TABLE");
        value.className = "table";
        for (let key in data){
            let row = document.createElement("TR");
            row.className = "tr";
            value.appendChild(row);
            let tablekey = document.createElement("TH");
            tablekey.className = "th";
            row.appendChild(tablekey);
            let tablevalue = document.createElement("TD");
            tablevalue.className = "td";
            row.appendChild(tablevalue);

            DisplayData(key, tablekey, true);
            DisplayData(data[key], tablevalue, false);
        }
    }
    
    container.appendChild(value);

}

function ExtractData(element){ // (TH or TD or TABLE or INPUT FIELD) ==> (Data)
    
    if (element.tagName === "TABLE"){
        let result = null;
        if (element.parentElement.children[0].textContent === "[#]"){ // element is table (list)
            
            result = [];
            
            [].slice.call(element.children).forEach(tablerow => {
                result.push(ExtractData(tablerow.children[0].children[1]));
                
            });
            
            
        }
        else if (element.parentElement.children[0].textContent === "{#}"){
            result = {};
            if (element.hasChildNodes()){
                
            [].slice.call(element.children).forEach(tablerow => {
                let key = tablerow.children[0].children[0].value;
                let value = ExtractData(tablerow.children[1].children[1]);
                result[key] = value;
            });
        }
            
            
        }
        return result;
    }
    switch (element.parentElement.children[0].textContent){
        case "abc": return String(element.value);
        case "123": if (isNaN(Number(element.value))){return element.value}else{return Number(element.value)};
        case "t/f": return (element.textContent === "true");
    }
    return null;
}

function ToggleBool(element){
    if (element.textContent === "true"){
        element.classList.remove("booltrue");
        element.textContent = "false"
        element.classList.add("boolfalse");
        return;
    }
    element.classList.remove("boolfalse");
    element.textContent = "true"
    element.classList.add("booltrue");

}

function OpenTypeselectorDialog(element){
    console.log(element);
    SelectedData = element;
    
    document.getElementById("typeselector-dialog").showModal();
}

function convertDataType(value, targetType) {
    
        switch (targetType.toLowerCase()) {
            case 'abc':
                
                return JSON.stringify(value);

            case '123':
                // Convert to a number or wrap in an array if conversion fails
                
                return Number(value);

            case 't/f':
                // Convert to boolean (0, "", null, undefined -> false, everything else -> true)
                return Boolean(value);

            case '[#]':
                // Return an array, or wrap the value in an array
                try{
                    let temp = JSON.parse(value);
                    return temp;
                }
                catch(err){
                if (value === null) return [];
                if (typeof value === "object" && !Array.isArray(value)) return Object.values(value);
                }
                return [];
            case '{#}':
                try{
                    let temp = JSON.parse(value);
                    return temp;
                }
                catch(err){
                    if (value === null) console.log("null");
                    console.log(Object.assign({}, value));
                    if (Array.isArray(value)) return value.reduce((obj, valu, index) => {
                        obj[index] = valu;
                        return obj;
                    }, {});;
                }
                
                return {};
            case 'null':
                return null;
            default:
                throw new Error('Unsupported target type');
        }
    
}

function SelectType(typeselector_element){
    let data = ExtractData(SelectedData.children[1]);
    SelectedData.removeChild(SelectedData.children[0]);
    SelectedData.removeChild(SelectedData.children[0]);
    
    DisplayData(convertDataType(data, typeselector_element), SelectedData, false);
    document.getElementById("typeselector-dialog").close();
}
