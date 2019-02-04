import app from 'firebase/app';
import 'firebase/auth'; // *** Auth API ***
import 'firebase/database'; // *** Database API ***

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
  doSendEmailVerification = () => this.auth.currentUser.sendEmailVerification({
    url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
  });

  // SignIn
  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  // SignIn via Google
  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  // SignIn via Facebook
  doSignInWithFacebook = () =>
    this.auth.signInWithPopup(this.facebookProvider);

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) => this.auth.onAuthStateChanged(async authUser => {
    // If authUser exist...
    if (authUser) {
      let contactsListStatus = 'uploading';
      let chatListStatus = 'uploading';
      let mergedContactsList = [];
      let mergedMessagesList = [];

      // Then fetch the data
      let snapshot = await this.user(authUser.uid).once('value');
      const dbUser = snapshot.val();
      const imageUrl = authUser.photoURL
        ? {uri: authUser.photoURL}
        : require('../../assets/profile_picture.png');

      // merge auth and db user
      authUser = {
        uid: authUser.uid,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        providerData: authUser.providerData,
        phoneNumber: authUser.phoneNumber,
        photoURL: imageUrl,
        ...dbUser,
      };

      // If the authUser is a new account,
      // then it has not initial contactsList
      // and chatList.
      if (!dbUser.contactsList) {

        // Default Empty contactsList
        dbUser.contactsList = [];
      }
      if (!dbUser.chatList) {

        // Default Empty contactsList
        dbUser.chatList = [];
      }

      // Convert contactsList obj from server to a list of array
      const contactsListArr = Object.values(dbUser.contactsList);

      // Fetch data by each element of array list
      await contactsListArr.map(async (contactObj, index) => {
        // The original contactObj is immutable,
        // to able to work on this object
        // merge it into a new object called mergedChatObj
        let mergedContactObj = {...contactObj};

        // Fetch merged contact object's username via
        // its own ID in users database
        const snapshot = await this.user(mergedContactObj.cid)
          .child('name')
          .once('value');

        mergedContactObj.name = snapshot.val();

        mergedContactsList = [
          mergedContactObj,
          ...mergedContactsList.filter(obj => obj.cid !== mergedContactObj.cid)
        ];

        // Merge new edited contactsList to authUser object
        // for later use in children components
        authUser.mergedContactsList = mergedContactsList;

        // ContactsList and Chatlist are fetched asyncronously,
        // so that we can not know which list will be fetched first
        // or lasr. In order to send authUser to application
        // we need to use this if condition in ContactList and also in chatList
        // to know that if data has fetched and done in both list.
        // If it is done, send authUser via next()
        if (index === contactsListArr.length -1) {
          if (!(contactsListStatus === 'uploaded')) {
            contactsListStatus = 'ready';
            if (chatListStatus === 'ready') {
              next(authUser);
              contactsListStatus= 'uploaded';
            }
          }
        }
      });

      // Convert chatList obj from server to a list of array
      const chatListArr = Object.values(dbUser.chatList);

      // Fetch data by each element of array list
      await chatListArr.map(async (chatObj, index) => {

        // The original chatObj is immutable,
        // to able to edis this object
        // merge it into a new object called mergedChatObj
        let mergedChatObj = {...chatObj};
        let contactName;

        // Both condition return an object
        contactsListStatus === 'ready'
          ? contact = await authUser.mergedContactsList.find(obj => obj.cid === mergedChatObj.contactId)
          : contact = await this.user(mergedChatObj.contactId).child('name').once('value');

          contactName = (
            typeof contact === 'object' &&
            contact !== null &&
            contact.val()
          ) || contact.name;

        // Fetch merged chat record object's history via
        // its own path in messages database
        const snapshot = await this.message(mergedChatObj.path)
          .child('messages')
          .orderByChild('createdAt')
          .limitToLast(10)
          .once('value');

        // The list of every message objects
        const messagesList = Object.values(snapshot.val()).reverse();

        // Merge every message objects with additional info
        // for later use in children components
        const messagesObj = {
          contactName: contactName,
          cid: mergedChatObj.contactId,
          path: mergedChatObj.path,
          messages: messagesList,
        };

        // Always merge new message obj on messagesList
        // to avoid duplicate of prev and next message obj
        mergedMessagesList = [
          messagesObj,
          ...mergedMessagesList.filter(obj => obj.cid !== messagesObj.cid)
        ];

        authUser.messagesList = mergedMessagesList;
        if (index === chatListArr.length -1) {
          if (!(chatListStatus === 'uploaded')) {
            chatListStatus = 'ready';
            if (contactsListStatus === 'ready') {
              next(authUser);
              chatListStatus= 'uploaded';
            }
          }
        }
      });
    } else {
      // If the authUser doesnt exist, run second function argument
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
      case 'resetPassword':
      return this.auth.verifyPasswordResetCode(oobCode);
      break;
      case 'recoverEmail':
      return null;
      break;
      case 'verifyEmail':
      return this.auth.applyActionCode(oobCode);
      break;
      default:
      return null;
    }
  }

  // Reset Password
  doPasswordReset = (oobCode, newPassword) => this.auth.confirmPasswordReset(oobCode, newPassword);

  // Update Name
  doUpdateName = name => this.auth.currentUser.updateProfile({displayName: name});

  // Update Photo
  doUpdatePhoto = photoURL => this.auth.currentUser.updateProfile({photoURL: photoURL});

  // Update Email
  doUpdateEmail = email => this.auth.currentUser.updateEmail(email);

  // Update password
  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  // *** User API ***
  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  searchUser = () => this.db.ref('users/{uid}/email');

  // *** DataBase API ***
  message = uid => this.db.ref(`messages/${uid}`);

  messages = () => this.db.ref('messages');
}

export default Firebase;
