
// Gets called whenever the user clicks "sign in" or "sign out".
function toggleSignIn() {
  if (!firebase.auth().currentUser) { // if the user's not logged in, handle login
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      console.log("success");
    }).catch(function(error) {
      console.error("error", error);
    });
  } else { // handle logout
    firebase.auth().signOut();
  }
  //This disables the button until login or logout is successful
  $('#login-button').attr("disabled", true);
}

// This gets called whenver the form is submitted.
// Uses jQuery to get the message info and passes it to addMessage() to actually submit the info to firebase.
function handleMessageFormSubmit() {
	var title = $("#post-title").val();
	var body = $("#post-body").val();
	addMessage(body,title);
}

// This function gets called with the new message information.
// It gets the user information and uses both to add the post to the database.
function addMessage(body, title) {
  var postData = {
    title: title,
    body: body
  };

  var newPostKey = firebase.database().ref().child('stream').push().key;
  firebase.database().ref('/stream/' + newPostKey).set(postData);
}


// This function sets up a listener when the page loads — '.on()' gets called automatically whenever something saved in '/stream/' changes.
// It's main purpose is to iterate over the stream in the database and add each message to the page.
window.onload = function() {
  const databaseStreamReference = firebase.database().ref('/stream/');

  databaseStreamReference.on('value', function(snapshot) {
    var messages = snapshot.val();
    $('#stream').empty();

    if (messages) {
      Object.keys(messages).forEach(function (key) {
        const message = messages[key];
        $('#stream').append(`<div>${message.title} — ${message.body}</div>`);
      });
    }
  });
};


/*

// Here we add the code to clear the form fields once the user has submitted their message
function handleMessageFormSubmit() {
	var title = $("#post-title").val();
	var body = $("#post-body").val();
	addMessage(body,title);
	$("#post-title").val("");
	$("#post-body").val("");
}

// The main purpose of this function is to set up a listener (using firebase) for when the auth state changes.
// If a user isn't authenticated, we should not show the stream and prompt them to log in.
// If a use IS authenticated, we should load/show the stream and give them the option to log out.
window.onload = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $('#stream').show();
      $('#login-button').html("Log out");
      initializeStreamListener(); //take the code that you used to run on load and put it into a new function. You'll then call it here.
    } else {
      $('#stream').hide();
      $('#login-button').html("Log in with google");
    }
    $('#login-button').attr("disabled", false);
  });
};

// This function gets the current user, retrieves their display name and their picture from that data, then saves it to the database
// Next try to put that information on the HTML page next to their message!
function addMessage(body, title) {

  var user = firebase.auth().currentUser;
  var authorPic = user.photoURL;
  var author = user.displayName;

  var postData = {
    title: title,
    body: body,
    author: author,
    authorPic: authorPic
  };

  var newPostKey = firebase.database().ref().child('stream').push().key;
  firebase.database().ref('/stream/' + newPostKey).set(postData);
}

*/
