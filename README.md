# Database Web App
Check it out at: https://hidden-inlet-38981.herokuapp.com/

Make sure you've followed all instructions for BaseWebApp. Today, we’ll be building a message stream app, where users can add posts that will be saved to a database and then displayed to the page. While this repo has full working code for hooking up our database to the application, we encourage you not to fork it like you did with BaseWebApp. Try things on your own, and if you get stuck, the code is here as a resource for you.

The files that you're going to change are `project/js/main.js`, `project/html/pages/index.ejs`, and `project/html/helpers/head.ejs`.

## I. Get your Firebase database set up


1. First, log in to your Google account (or create one) and 'Add Project' on Firebase, a database service built by Google, at `https://console.firebase.google.com`. Name it whatever you like!

2. When your database is ready, it should take you to an overview page. We'll come back to this.

3. In the sidebar, select 'Develop' -> 'Authentication' and then the 'Set up sign-in method' in the middle of the page. Select Google for now, flip the switch to 'Enable', add your email address if required, then save. This will make Google the sign-in method to use your web application. _Can you think of why we'd want to make people log in before they can use your app? Ask a HubSpotter near you what they think!_

4. While still on the sign in method page, scroll down and add your app's base url to the `Authorized domains` list (in my case, I added `hidden-inlet-38981.herokuapp.com`). This essentially gives your app permission to use the database.

5. In the sidebar, select 'Develop' -> 'Database', and click the “Create Database” button. Change your security rules to “Test Mode” — we want to be able to read and write to our database, after all. After your database is created, select the dropdown that says "Cloud Firestore" on the header, and switch your database to "Realtime Database".

6. On this same screen, select the top nav item "Rules". Make sure the rules look like the code below, then publish your changes:
```
      {
        "rules": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
```

## II. Add Firebase to your app


1. While still on the Firebase website, go back to “Project Overview” in the left navigation and select the angle brackets under 'Get started by adding Firebase to your app'.
<div style="text-align:center"><img src ="https://d2mxuefqeaa7sj.cloudfront.net/s_0B2FBC1C225F1AB4C2B888C7BB8510368E050ED500396ECDF2923157F2823B9A_1552942056201_image.png" /></div>

2. You should see a bunch of code pop up. Copy that code, and paste it into your `head.ejs` file before the link to your app’s `main.js` file. 

3. Next, we need to hoop up your API key. Leaving API keys in your code is bad — bots continuously scrape Github looking for API Keys to abuse! These next steps help you "hide" your API key from the code that lives on Github, but still makes it accessible to your app.

4. Run `heroku config:set API_KEY=whatever-your-API-key-is` in your terminal, substituting `whatever-your-API-key-is` for the string of characters that come after the apiKey variable in that block of code you just copied over. Don’t include the quotation marks.

_Remember that you must stop your server in order to do this. If your server is still running from before, you can press control + c to halt it._

5. Then run `heroku config:get API_KEY -s >> .env`. This writes the `API_KEY` variable to a file named `.env`. This file will never be pushed to Github/Heroku; the web app will read from this file locally, and will pull it from Heroku's own configuration system once deployed. This way you can use API_KEY in your local environment and on Heroku without actually having it in your code.

6. In your `head.ejs` file, replace your API key with the environment variable we just created: `"``<%= process.env.API_KEY %>``"`

_Remember, you can restart your server by running `heroku local web`._

_There are 2 ways to interact with a database. To use Firebase, we're using the API they provided. The other way would be to access a database directly through server-side code. The server-side code would then pass the relevant data to the page that gets rendered. Can you think of why you would choose one over the other? Ask a HubSpotter what they think!_


## III. Get the data into the database, and out of it.

_For each of these steps, make sure you reload the page that's running locally to check that it's working._

1. We want users to be able to submit their own messages to the database. For that, we’ll need a form. Check out this resource (https://www.w3schools.com/html/html_forms.asp) for building forms in HTML. 
   - For your form, you’ll want input fields for your post title and post body (make sure each of these fields has a unique `id` so we can grab the value later).
   - You’ll also want a button to submit the form. Feel free to modify the button that’s already on your page from BaseWebApp, since we’ll also be using an `onClick` handler to submit the form. Go ahead and build that, checking to make sure you can see it on the page. 


2. Next, we need to make sure that the user is logged in before they can submit anything to the database. 
   - Add another button to the top of your page. Make the text something like “Log in”, and set `onClick` equal to `"toggleSignIn()"` — that’s the function that we’ll use to sign users in. Give that, too, an `id`.
   - Since the code part is a little tricky, we’ll give you a hint. You’ll want to copy the following code into your `main.js` file, but make sure to give it a read so you understand what it’s doing:
  ```
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
      //This disables the button until login or logout is successful. You'll want to replace 'login-button' with the id of your login button.
      $('#login-button').attr("disabled", true);
    }
```
   - Save everything, then click the login button to check that it works. You should see a pop up asking you to sign in or select an account. Once that’s done, you can check your developer console to make sure it worked (Chrome > View > Developer > Developer Tools) — you’ll see “success” if the login was successful, and an error if it wasn’t.


3. Next, we want to send some data to the database! 
   - First, we want to collect the data from the input fields when the form is submitted. For the form button, set the `onClick` to `handleMessageFormSubmit()` — that’s the function we’ll call when we want to submit the form.
   - Now, we’ll need to write that function. Go into `main.js` and create that function — if you need some help, just look at the other functions in that file!
   - In this function, we’ll want to actually grab the values from the text fields. We can do that using jQuery and the text field’s `id`, and setting that equal to a variable. It’ll look something like:  `var title = $("#post-title").val();` Here, our text field’s `id` was `post-title`, but be sure to set that value to whatever your field’s `id` is. 
   - Create a variable for the post body in the same way. If you’d like to make sure these are working, you can log them in your console by writing `console.log(title);` under your two variable declarations. Then save your work, refresh your web app’s page, type some text in the input fields in your web app, click the submit button, and check your developer console to make sure it’s pulled the variables correctly (Chrome > View > Developer > Developer Tools). If you see the value `null`, it hasn’t — go back and check your work.
   - Once that’s working, we’ll want to actually send it to the database. We’ll call another function to do this. Inside your `handleMessageFormSubmit()` function, call a function called addMessage, and pass in the two variables you’ve just created: `addMessage(body, title);`(in our case, they were `body` and `title`).
   _Remember, if you’re lost, feel free to check out the code in this repo for reference!_


4. Now it’s time to write the addMessage function — make sure to pass the body and title in as variables. 
   - Next, you’ll want to put the data into a format that can be saved — called JSON (here’s some more info on JSON if you’d like more reference). We’re going to create a variable called postData, then set it equal to some key/value pairs for the body and title. It’ll end up looking something like:
```
      var postData = {
        title: title,
        body: body
      };
 ```
   - Next, we need to send that data to the database. We want to store our messages in something we’ll call a `stream`. We’ll help you with the two lines you’ll need: 
  
  ```
    var newPostKey = firebase.database().ref().child('stream').push().key;
    firebase.database().ref('/stream/' + newPostKey).set(postData);
  ```
   In this code, we create a variable called `newPostKey`, create a new `stream` object in our database, then get the key for the post we just created. Then, referencing that new post we just created, we send it the JSON data using the `postData` variable we just created.
   - Now, save you work, then go to your app and try submitting some data in your form. Check your console to see if there were any errors. If not, you should be able to go to Firebase and click on Develop > Database. Under the Data tab, you should see the data that you just saved!


5. We’ve gotten our data into our database. Now, we need to get that data from the database and display it on the page for the world to see!
   - First, we’ll need to create a place for that data to live. In your `index.ejs` page, under your form, create a div with an `id` called “stream”. 
   - We’ll help you with the second part — retrieving the data from the database. This is the function you’ll want to use:
  ```
    window.onload = function() {
      const databaseStreamReference = firebase.database().ref('/stream/');
    
      databaseStreamReference.on('value', function(snapshot) {
        var messages = snapshot.val();
        $('#stream').empty();
    
        if (messages) {
          Object.keys(messages).forEach(function (key) {
            const message = messages[key];
            $('#stream').append(`<div>${message.body}</div>`);
          });
        }
      });
    };
  ```
   You can see here that this function gets called when the app loads. We create a variable that holds all our database’s messages. Then, when a value changes, the app will retrieve a new copy of what’s in the database, empty out what’s in the `stream` div on your page, and if there are messages to display, it’ll iterate over that array of messages and put each message body on the page. Now, try to show just the title on the page — or both. How would you do that?

## IV. Additional features

1. When you submit a post, the text inputs don't clear back to empty. Is there a way we could use jQuery to reset the fields for the next post? _Check the commented out code in our `main.js` file if you get stuck._
2. Right now, the login button always shows “log in”. How do we get it to show “log out” when the user is currently logged in? How do we stop the app from showing the message stream when the user isn’t logged in? _Check the commented out code in our `main.js` file if you get stuck_
3. What if we want to send the user’s information to the database as well? We’ll give you a hint — you can get the user information by creating a user variable like so: `var user = firebase.auth().currentUser;`. Then you can get the user’s name like so: `var author = user.displayName;` How would you send that information to the database? How would you get that user’s picture and display it next to their entry? Remember, if you want more insight into what’s going on, write `console.log()` with whatever value you’d like in the parentheses. Then, when the code runs, that value will show in the developer tools. _Check the commented out code in our `main.js` file if you get stuck_
4. Add a "like" feature for posts. This would involve a few steps:
   - Add a button to each post
   - Use javascript and jQuery to monitor when someone clicks the button.
   - When someone does click the "like" button, use the post's key to update a "likes" counter on the object already saved in Firebase. To keep track of the key when the `onClick` handler is called, check out something in Javascript called "bind". To update a field in Firebase, your function will look VERY similar to `addMessage()`, except using `.update(postData)` instead of `.set(postData)`.


----------------------------------------------------------------------------------------------


### Other resources

Here are some external resources we've gathered to help you with further development.

**Git and GitHub tutorials**
Version control is an important tool for every developer, and git is the most popular one. Learn more [useful git commands](https://try.github.io/levels/1/challenges/1), discover [the branching]( https://learngitbranching.js.org/) and then check [how to use GitHub](https://guides.github.com/activities/hello-world/) for your own project.

**Web App tutorials (HTML, CSS, JavaScript)**
There are plenty of different and more comprehensive tutorials and online resources to learn HTML, CSS and JavaScript. 


- FreeCode Camp interactive web development tutorial: https://www.freecodecamp.org/ 
- Khan Academy free html and css tutorial: https://khanacademy.org/computing/computer-programming/html-css 
- Comprehensive web development tutorial/documentation by Mozilla: https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web

- CSS visual guide: https://cssreference.io/ 
- Flexbox tutorial: http://flexboxfroggy.com/ 

- HTML cheatsheet: http://www.hostingreviewbox.com/html5-cheat-sheet/

**More Web App tutorials (FE frameworks)**
Once you have comfortability with JS, CSS and HTML, try out a frontend framework to take your skills to the next level.

- Learning React with create-react-app: https://medium.com/in-the-weeds/learning-react-with-create-react-app-part-1-a12e1833fdc

**Inspiration and problem solving**
To practice your problem solving skills and find some inspiration, please check the following pages: 
- [StackOverflow](https://stackoverflow.com/) is a great place to ask any question (or search for it first, because it’s very likely that someone has already asked the same question and got an answer :))
- [Code Pen](https://codepen.io/) is a great source of inspiration with a lot of projects based on HTML, CSS and JavaScript
- [Dev.to](https://dev.to/) is a blog platform where you can find plenty of useful posts from other developers.
