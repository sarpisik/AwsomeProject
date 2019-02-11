import AuthUserContext from './context';
import withAuthentication from './withAuthentication';
import withAuthorization from './withAuthorization';
// import withEmailVerification from './withEmailVerification';

export {
  // React.createContext
  AuthUserContext,
  // export authenticated user via AuthUserContext
  withAuthentication,
  // Show AppStack
  withAuthorization,
  // Show component if email verified
  // withEmailVerification
};
