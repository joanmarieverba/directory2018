
//remove CORS when deployed
// CORS - This code allows you to develop locally. Otherwise this app only works when deployed
    (function () {
        var cors_api_host = 'cors-anywhere.herokuapp.com';
        var cors_api_url = 'https://' + cors_api_host + '/';
        var slice = [].slice;
        var origin = window.location.protocol + '//' + window.location.host;
        var open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var args = slice.call(arguments);
            var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
            if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
                targetOrigin[1] !== cors_api_host) {
                args[1] = cors_api_url + args[1];
            }
            return open.apply(this, args);
        };
    })();
  // CORS - end.

// Initialize Firebase

firebase.initializeApp(config);

let database = firebase.database();

// first time user
$("#signup").on("click", function () {
    let email = $("#txtemail").val();
    let password = $("#txtpw").val();
    console.log("this worked");
    console.log(email, password);
    //declare auth
    const auth = firebase.auth();
    const promise=auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));

});

// previous user signs in
$("#login").on("click", function () {
    let email = $("#txtemail").val();
    let password = $("#txtpw").val();
    console.log("this worked");
    console.log(email, password);
    //declare auth
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));

});

let uid = "";


firebase.auth().onAuthStateChanged(firebaseUser => { 
    if (firebaseUser) {
    console.log(firebaseUser);
    //hide the login information
        $("#txtemail").hide();
        $("#txtpw").hide();
        $("#signup").hide();
        $("#login").hide();
        $("#logout").show();
        $("#show_on_login").show();
        $("#results").hide();
        uid = firebaseUser.uid;
        console.log("uid ", uid);



    } else {
        console.log("not logged in");
        $("#logout").hide();
        $("#txtemail").show();
        $("#txtpw").show();
        $("#signup").show();
        $("#login").show();
        $("#show_on_login").hide();
    };
});

//  logout
$("#logout").on("click", function () {
    firebase.auth().signOut();
});


//delete a list item
$(document).on("click", ".deletebtn", function (event) {


    let key = $(this).attr("data");
    console.log("key  ", key);

    database.ref().child(key).remove();
    //location.reload();
});

//modify a list item
$(document).on("click", ".modifybtn", function (event) {

    let key = $(this).attr("data");
    console.log("key  ", key);
    $('#myModal').modal();

    database.ref().child(key).on("value", function (snap) {
        console.log(snap.val());
        console.log("modal name ", snap.val().wname);
        $("#mname").val(snap.val().wname);
        $("#mlname").val(snap.val().wlname);
        $("#maddress").val(snap.val().waddress);
        $("#mphone").val(snap.val().wphone);
        $("#memail").val(snap.val().wemail);
        $("#mwebsite").val(snap.val().wwebsite);
        $("#mcredits").val(snap.val().wcredits);
        $(".editentry").attr("key",key);
    });
    // location.reload();
});

// edit an author
$(document).on("click", ".editentry", function (event) {
    event.preventDefault();

    let mname = $("#mname").val();
    let mlname = $("mlname").val();
    let maddress = $("#maddress").val();
    let mphone = $("#mphone").val();
    let memail = $("#memail").val();
    let mwebsite = $("#mwebsite").val();
    let mcredits = $("#mcredits").val();
    let mkey = $(".editentry").attr("key");
    console.log("mkey, ", mkey);
    database.ref("/" + mkey).set({
        wname: mname,
        wlname: mlname,
        waddress: maddress,
        wphone: mphone,
        wemail: memail,
        wwebsite: mwebsite,
        wcredits: mcredits,
    });
    $('#myModal').modal('hide')
});

// add an author
$(document).on("click", ".addentry", function (event) {
    event.preventDefault();

    //let item = $("#item").val();

    // This  code will grab the input from the textbox
    let authorName = $("#name").val().trim();
    let authorLname = $("#lname").val().trim();
    let authorAddress = $("#address").val().trim();
    let authorPhone = $("#phone").val().trim();
    let authorEmail = $("#email").val().trim();
    let authorWebsite = $("#website").val().trim();
    let authorCredits = $("#credits").val().trim();

    // Creates local "temporary" object for holding data
    let newAuthor = {
        wname: authorName,
        wlname: authorLname,
        waddress: authorAddress,
        wphone: authorPhone,
        wemail: authorEmail,
        wwebsite: authorWebsite,
        wcredits: authorCredits,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    };

    // Uploads new data to the database
    database.ref().push(newAuthor);


    //clear all text boxes
    $("#name").val("");
    $("#lname").val("");
    $("#address").val("");
    $("#phone").val("");
    $("#email").val("");
    $("#website").val("");
    $("#credits").val("");
});

// Place entries into table

database.ref().on("value", function (contents) {
    $("#directory-entry").empty();

    contents.forEach(function (data){
        // Add data into the table
        console.log("data.key", data.key);
        $("#directory-entry").append("<div>" + 
        data.val().wname + " " + data.val().wlname + "</div><div>" + 
        data.val().waddress + "</div><div>" +
        data.val().wphone + "</div><div>" + 
        data.val().wemail + "</div><div>" + 
        data.val().wwebsite + "</div><div>" + 
        data.val().wcredits + "</div>"
            + "<button class='modifybtn' data=" + data.key + ">EDIT ENTRY</button>"
            + "<button class='deletebtn' data=" + data.key + ">DELETE ENTRY</button></div>"
            + "<div>" + "<hr>" + "</div>");

    })
});


//SEARCH

$(".glyphicon-search").on("click",function (){
    let searchTerm = $("#search").val();
    console.log("works");
    database.ref().child('/').orderByChild('wname').equalTo(searchTerm).on("value", function (snapshot) {
        $("#results").show();
        snapshot.forEach(function (data) {
            console.log(data.val());
            //id or class and append or use modal
            $("#results").append("<div>" +
                data.val().wname + " " + data.val().wlname + "</div><div>" +
                data.val().wlname + "</div><div>" +
                data.val().waddress + "</div><div>" +
                data.val().wphone + "</div><div>" +
                data.val().wemail + "</div><div>" +
                data.val().wwebsite + "</div><div>" +
                data.val().wcredits + "</div>"
                + "<button class='modifybtn' data=" + data.key + ">EDIT ENTRY</button>"
                + "<button class='deletebtn' data=" + data.key + ">DELETE ENTRY</button></div>"
                + "<div>" + "<hr>" + "</div>");
        });
    });
    //clear text box
    $("#search").val("");
})



// Order by value
// firebase.database().ref('Regions').orderByValue.on('value', function (snapshot) {
//     loadRegions(snapshot.val());
// });