import React, { Component } from "react";
import PropTypes from "prop-types";
import Profile, { Info } from "../../Profile";
import Button from "../../Button";

export default class Account extends Component {
  constructor(props) {
    super(props);
    const { authUser } = props;

    this.state = {
      creationTime: new Date(authUser.creationTime).toUTCString()
    };
  }

  render() {
    const { authUser } = this.props;
    const { creationTime } = this.state;
    return (
      <Profile
        imageURL={authUser.photoURL}
        userName={authUser.name}
        status={authUser.status || "online"}
      >
        <Info
          description={authUser.description || "No description"}
          email={authUser.email}
          creationTime={creationTime}
          phone={authUser.phoneNumber}
        />
        {/* BUTTONS */}
        <Button
          title="Change Password"
          onPress={() => console.log("Not configured yet")}
        />
        <Button
          title="Reset Password"
          onPress={() => console.log("Not configured yet")}
        />
      </Profile>
    );
  }
}

Account.propTypes = {
  authUser: PropTypes.object.isRequired,
  firebase: PropTypes.object.isRequired
};
