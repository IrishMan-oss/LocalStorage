let ASN1 = require("./asn1");
let Base64 = require("./base64");
let Hex = require("./hex");
require("./dom");

const textArea = document.querySelector(".txtarea");
const btn = document.querySelector(".btn");
let area = document.getElementById("area");
let listWrapper = document.getElementById("certificates-wrap");
let reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;

const arr = [
  {
    "commonName": 'test',
    "issuerCn": 'test1',
    "validFrom": 'test2',
    "validTill": 'test3'
  }
];
const dataList = JSON.parse(localStorage.getItem("ser"));

function createList (){
  for (let i = 0; i < arr.length; i++) {
    let listItem = document.createElement("li");
    let btn = document.createElement("button");

    btn.dataset.name = arr[i]["commonName"];
    btn.dataset.issuer = arr[i]["issuerCn"];
    btn.dataset.validFrom = arr[i]["validFrom"];
    btn.dataset.validTill = arr[i]["validTill"];
    btn.innerText = arr[i]["commonName"];

    listItem.append(btn);
    listWrapper.append(listItem);
  }
}






listWrapper.addEventListener("click", (e) => {
  const name = e.target.dataset.name;
  const issuer = e.target.dataset.issuer;
  const validFrom = e.target.dataset.validFrom;
  const validTill = e.target.dataset.validTill;

  area.value = `Common name: ${name} \nIssuer CN: ${issuer}\nValid form: ${validFrom}\nValid till: ${validTill}`;
});

btn.addEventListener("click", (e) => {
  let btnContent = e.currentTarget.textContent;
  if (btnContent === "Добавить") {
    textArea.classList = "drop";
    btn.innerHTML = "Отменить";
    area.value = "";
  } else {
    textArea.classList = "txtarea";
    btn.innerHTML = "Добавить";
  }
});

function decode(der, offset) {
  offset = offset || 0;
  try {
    var asn1 = ASN1.decode(der, offset);
    if (asn1.typeName() !== "SEQUENCE") {
      throw "Неверная структура конверта сертификата (ожидается SEQUENCE)";
    }
    asn1.toDOM();

    let commonName =
      asn1.sub[0].sub[5].sub[3].sub[0].node.childNodes[2].childNodes[1]
        .childNodes[0].childNodes[2].innerText;
    let issuerCn =
      asn1.sub[0].sub[3].sub[2].sub[0].sub[1].node.childNodes[1].childNodes[6]
        .innerHTML;
    let validFrom =
      asn1.sub[0].sub[4].sub[0].node.childNodes[0].childNodes[2].innerText;
    let validTill =
      asn1.sub[0].sub[4].sub[1].node.childNodes[0].childNodes[2].innerText;

    let arrFile = { commonName, issuerCn, validFrom, validTill };
    arr.push(arrFile);
    loadNewData(arr);
    createList(arr)
    // console.log("Common name: ", asn1.sub[0].sub[5].sub[3].sub[0].node.childNodes[2].childNodes[1].childNodes[0].childNodes[2].innerText);
    // console.log("Issuer CN: ", asn1.sub[0].sub[3].sub[2].sub[0].sub[1].node.childNodes[1].childNodes[6].innerHTML);
    // console.log("Valid From: ", asn1.sub[0].sub[4].sub[0].node.childNodes[0].childNodes[2].innerText);
    // console.log("Valid Till: ", asn1.sub[0].sub[4].sub[1].node.childNodes[0].childNodes[2].innerText);
  } catch (e) {
    console.error(e);
  }
}

function stop(e) {
  e.stopPropagation();
  e.preventDefault();
}
function decodeBinaryString(str) {
  var der;
  try {
    if (reHex.test(str)) der = Hex.decode(str);
    else if (Base64.re.test(str)) der = Base64.unarmor(str);
    else der = str;
    decode(der);
  } catch (e) {
    console.error(e);
  }
}
function read(f) {
  area.value = ""; // clear text area, will get b64 content
  var r = new FileReader();
  r.onloadend = function () {
    if (r.error)
      alert(
        "Your browser couldn't read the specified file (error code " +
          r.error.code +
          ")."
      );
    else decodeBinaryString(r.result);
  };
  r.readAsBinaryString(f);
}

function dragAccept(e) {
  stop(e);
  if (e.dataTransfer.files.length > 0) read(e.dataTransfer.files[0]);
}
document.ondragover = stop;
document.ondragleave = stop;

if ("FileReader" in window && "readAsBinaryString" in new FileReader()) {
  document.ondrop = dragAccept;
}

function loadNewData(a) {
  localStorage.setItem("ser", JSON.stringify(a));
}
