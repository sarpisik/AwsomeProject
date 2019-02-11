import app from "firebase/app";
import "firebase/auth"; // *** Auth API ***
import "firebase/database"; // *** Database API ***

// const config = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
// };
const config = {
  apiKey: "AIzaSyDcu6wm5aX8y7KMYLSA31q_p5gazw3JvHc",
  authDomain: "awsomeproject-31e98.firebaseapp.com",
  databaseURL: "https://awsomeproject-31e98.firebaseio.com",
  projectId: "awsomeproject-31e98",
  storageBucket: "awsomeproject-31e98.appspot.com",
  messagingSenderId: "383349235809"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;
    this.auth = app.auth();
    this.db = app.database();

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
  }

  // *** Auth API ***

  // SignUp
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  // Send Email Verification
  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT
    });

  // SignIn
  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  // SignIn via Google
  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  // SignIn via Facebook
  doSignInWithFacebook = () => this.auth.signInWithPopup(this.facebookProvider);

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(async authUser => {
      // If authUser exist...
      if (authUser) {
        // Then fetch the data
        let snapshot = await this.user(authUser.uid).once("value");
        const dbUser = await snapshot.val();
        const imageUrl = authUser.photoURL
          ? { uri: authUser.photoURL }
          : require("../../assets/profile_picture.png");

        // If the authUser is a new account,
        // then it has not initial contactsList
        // and chatList.
        if (!dbUser.contactsList) {
          // Default Empty contactsList
          dbUser.contactsList = {};
        }
        dbUser.mergedContactsList = [];
        if (!dbUser.chatList) {
          // Default Empty contactsList
          dbUser.chatList = {};
        }
        dbUser.messagesList = [];

        // merge auth and db user
        authUser = {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          providerData: authUser.providerData,
          phoneNumber: authUser.phoneNumber,
          photoURL: imageUrl,
          ...dbUser
        };

        next(authUser);
      } else {
        // If the authUser doesn't exist, run second function argument
        fallback();
      }
    });

  // SignOut
  doSignOut = () => this.auth.signOut();

  // Send password reset link
  doSendPasswordResetEmail = email => this.auth.sendPasswordResetEmail(email);

  // Handle Account Sessions
  doHandleAccountSession = (mode, oobCode) => {
    switch (mode) {
      case "resetPassword":
        return this.auth.verifyPasswordResetCode(oobCode);
        break;
      case "recoverEmail":
        return null;
        break;
      case "verifyEmail":
        return this.auth.applyActionCode(oobCode);
        break;
      default:
        return null;
    }
  };

  // Reset Password
  doPasswordReset = (oobCode, newPassword) =>
    this.auth.confirmPasswordReset(oobCode, newPassword);

  // Update Name
  doUpdateName = name =>
    this.auth.currentUser.updateProfile({ displayName: name });

  // Update Photo
  doUpdatePhoto = photoURL =>
    this.auth.currentUser.updateProfile({ photoURL: photoURL });

  // Update Email
  doUpdateEmail = email => this.auth.currentUser.updateEmail(email);

  // Update password
  doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  // *** User API ***
  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref("users");

  searchUser = () => this.db.ref("users/{uid}/email");

  // *** DataBase API ***
  message = uid => this.db.ref(`messages/${uid}`);

  messages = () => this.db.ref("messages");
}

export default Firebase;
