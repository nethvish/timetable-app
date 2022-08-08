// data structure
// keys.fac.FOC.Y2.S1.SE.table.tuesday[2]
// keys.fac.<faculty>.<year>.<sem>.<spec>.table.<dayToday>

const { link } = require("fs");

// read username on click continueBtn
function readUsername() {
  let loginSection = document.getElementById("login-section");
  // read name from field
  let readVal = document.getElementById("username-field").value;
  if (readVal == "") {
    loginError("Enter your name");
    // shake on error
    shake(loginSection);
  } else {
    username = readVal;

    // get faculty list from JSON object and add to the dropdown list
    // read json file and get data to keys[]
    fetch("./data.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => (keys = data))
      .then(function () {
        getFacList();
        transition("login-section", "details-section");
      });
  }
}

// get faculty list from JSON obj
function getFacList() {
  let html_content = '<option value="Select">Select</option>';
  let array = Object.keys(keys.fac);
  array.forEach((element) => {
    html_content += '<option value="' + element + '">' + element + "</option>";
  });
  select_fac.innerHTML = html_content;
}

// read details and (save them to cookies) -> at last
function readDetails() {
  let detailsSection = document.getElementById("details-section");

  options[0] = document.getElementById("select-fac").value;
  options[1] = document.getElementById("select-year").value;
  options[2] = document.getElementById("select-1").value;
  options[3] = document.getElementById("select-2").value;
  options[4] = document.getElementById("select-3").value;

  randomSeed = Math.floor(Math.random() * 100000) + 1;
  options[5] = randomSeed;

  if (checkVals() == 1) {
    shake(detailsSection);
    detailsError("Select options for all");
  } else {
    // save details to cookies
    setDetails(options);
    displayUserData();
    displayTable();
    // transition to next page
    transition("details-section", "main-section");
  }

  // load values from db and display

  // to check if options are 0
  function checkVals() {
    for (i = 0; i < options.length; i++) {
      if (options[i] == 0 || options[i] == "Select") {
        return 1;
      } else {
        continue;
      }
    }
  }
}

// function to write metadata
function displayUserData() {
  // get time
  var myDate = new Date();
  var hrs = myDate.getHours();
  let greet;

  if (hrs < 12) greet = "Good Morning";
  else if (hrs >= 12 && hrs <= 15) greet = "Good Afternoon";
  else if (hrs >= 15 && hrs <= 24) greet = "Good Evening";

  // display time
  document.getElementById("greeting-wish").innerText = greet;
  document.getElementById("greeting-username").innerText = username;

  // display pfp
  document.querySelector(
    ".pfp"
  ).innerHTML = `<img id="main-pfp" src="https://avatars.dicebear.com/api/bottts/${randomSeed}.svg" alt="" />`;

  displayTable();
}

/**display table */
function displayTable() {
  let table = keys.fac[faculty][year][semester][spec][sub].table;

  let num = table[dayToday].length;
  let html_content = "";

  // get now date time
  var now = new Date();

  var nowDateTime = now.toISOString();
  var nowDate = nowDateTime.split("T")[0];

  if (num) {
    document.getElementById("date-display").innerHTML = `${dayToday}`;
    for (i = 0; i < num; i++) {
      let cardColorClass = "";
      let linkTag = "";

      if (table[dayToday][i].link) {
        let link = table[dayToday][i].link;
        linkTag =
          '<a class="link-btn" href="' +
          link +
          '" target="_blank"><i class="fa-solid fa-link"></i><span class="link-btn-text">Link</span></a>';
      } else {
        linkTag = "<i>Link not added 🔗❌</i>";
      }

      let startTime = table[dayToday][i].start;
      let endTime = table[dayToday][i].end;

      if (startTime.length != 5) {
        startTime = addLeadingZeros(startTime, 5);
      }

      if (endTime.length != 5) {
        endTime = addLeadingZeros(endTime, 5);
      }

      var targetStart = new Date(nowDate + "T" + startTime + ":00");
      var targetEnd = new Date(nowDate + "T" + endTime + ":00");

      if (targetStart <= now && targetEnd > now) {
        cardColorClass = "ongoing";
      } else if (targetStart > now && targetEnd > now) {
        // display default color
        cardColorClass = "";
      }

      html_content +=
        '<div class="card timecard ' +
        cardColorClass +
        '" id="card' +
        (i + 1) +
        '">' +
        '<div class="row">' +
        '<p class="title">' +
        table[dayToday][i].mod +
        " <span id='module-code'>" +
        table[dayToday][i].code +
        "</span></p>" +
        '<p class="type">' +
        table[dayToday][i].type +
        "</p>" +
        "</div>" +
        '<div class="row">' +
        '<p class="time">' +
        table[dayToday][i].start +
        " - " +
        table[dayToday][i].end +
        "</p>" +
        linkTag +
        "</div>" +
        "</div>";
    }
  } else {
    document.getElementById("date-display").innerHTML = `${dayToday}`;

    let displayDay;

    // set display message day
    if (dayToday == realDay) {
      displayDay = "today";
    } else {
      displayDay = dayToday;
    }

    html_content += `
      <div class="no-lecs-msg">
            <p>Nice! No lectures for <span> ${displayDay}</span>! 😃</p>
            <img
              id="no-lecs-img"
              src="./images/no-lecs-svg.svg"
              alt="playing cat"
            />
      </div>`;
  }

  document.getElementById("cards-container").innerHTML = html_content;

  if (thisVersion != getCookie("version")) {
    let versionData;
    fetch("./version-info.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => (versionData = data))
      .then(function () {
        showAlert(
          versionData.title,
          versionData.subtitle,
          versionData.notes,
          versionData.alert_btn
        );
      });
  }
}

function displayTime() {
  let currentTime = document.getElementById("greeting-time");
  let now = new Date().toLocaleTimeString();
  currentTime.innerHTML = now;
}

function addLeadingZeros(str, targetLength) {
  return str.padStart(targetLength, "0");
}

// transition
// page1 = current page id
// page2 = next page id
function transition(page1, page2) {
  let object1 = document.getElementById(page1);
  let object2 = document.getElementById(page2);
  object2.style.display = "flex";
  object1.style.display = "none";
  fadeIn(object2);
}

function logOut() {
  delCookie("username");
  delCookie("faculty");
  delCookie("year");
  delCookie("semester");
  delCookie("spec");
  delCookie("sub");
  delCookie("seed");
}

// set details to cookies
function setDetails(options) {
  setCookie("username", username, 90);
  setCookie("faculty", options[0], 90);
  setCookie("year", options[1], 90);
  setCookie("semester", options[2], 90);
  setCookie("spec", options[3], 90);
  setCookie("sub", options[4], 90);
  setCookie("seed", options[5], 90);
}

// set a cookie
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// delete cookie
function delCookie(cname) {
  document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// get a cookie by name
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// display error msg on notif area
// in login section
function loginError(message) {
  let loginNotifArea = document.getElementById("login-notif-area");
  loginNotifArea.innerHTML = message;
}
// in login section
function detailsError(message) {
  let detailsNotifArea = document.getElementById("details-notif-area");
  detailsNotifArea.innerHTML = message;
}

// ANIMATIONS JS

// shake object on error
// pass the object to shake as argument
function shake(object) {
  object.classList.add("shake");
  setTimeout(function () {
    if (object.classList.contains("shake")) {
      object.classList.remove("shake");
    }
  }, 400);
}

// fade in
function fadeIn(object) {
  object.classList.add("fade-in");
  setTimeout(function () {
    if (object.classList.contains("fade-in")) {
      object.classList.remove("fade-in");
    }
  }, 400);
}

function showAlert(title, subtitle, message, button) {
  let messageContent = document.getElementById("message-content");

  messageContent.innerHTML = `
  <div class="alert-wrapper">
  <div class="alert-box">
    <p class="title">${title}</p>
    <div class="separator"></div>
    <div class="alert-body">
    <p class="title">${subtitle}</p>
    ${message}</div>
    <div class="row">
      <button class="btn-okay" id="alertbox-btn-ok" onclick="closeAlert()">${button}</button>
    </div>
  </div>
</div>
`;
}

function closeAlert() {
  setCookie("version", thisVersion, 90);
  let messageContent = document.getElementById("message-content");
  messageContent.innerHTML = "";
}
