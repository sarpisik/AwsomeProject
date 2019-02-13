import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text } from "react-native";

import { withHeader } from "../../HOCs/withHeader";
import { withAuthorization } from "../../Session";
import * as ROUTES from "../../constants";
import Profile, { Info } from "../../Profile";
import Button from "../../Button";

// SHOW CONTACT DETAILS
class ContactScreen extends Component {
  constructor(props) {
    super(props);

    const { name, cid, email, addedTime, phoneNumber } = props.location.state;

    this.state = {
      isLoading: false,
      chatPath: "",
      name: name,
      cid: cid,
      email: email,
      addedTime: addedTime,
      phoneNumber: phoneNumber,
      isButtonLoading: false,
      error: null
    };
  }

  async componentDidMount() {
    const { authUser } = this.props;
    const { cid } = this.state;
    await this.setState({ isLoading: true });

    // Look for an existing chat record
    const chatRecord = await authUser.messagesList.find(
      obj => obj.contactId === cid
    );

    // If the chat record exist...
    chatRecord
      ? // Then save the path in state
        this.setState({
          chatPath: chatRecord.path,
          isLoading: false
        })
      : this.setState({ isLoading: false });
  }

  onNavigate = (name, cid, chatPath) => {
    const { history } = this.props;

    history.push({
      pathname: `/${ROUTES.CHAT_SCREEN}`,
      state: {
        contactName: name,
        cid: cid,
        path: chatPath
      }
    });
  };

  onRemove = async key => {
    const { authUser, firebase, history } = this.props;

    try {
      await this.setState({ isButtonLoading: true });
      // Find contact in database
      await firebase
        .user(authUser.uid)
        .child(`contactsList/${key}`)
        .remove();

      // Go previous screen
      history.goBack();
    } catch (error) {
      this.setState({ error, isButtonLoading: false });
    }
  };

  render() {
    const {
      location: { state }
    } = this.props;
    const {
      isLoading,
      isButtonLoading,
      name,
      cid,
      chatPath,
      error
    } = this.state;

    if (isLoading) return <Text>Loading...</Text>;

    return (
      <Profile
        imageURL={state.photoURL || null}
        userName={state.name}
        status={state.status || "online"}
      >
        <Info
          description={state.description || "No description"}
          email={state.email}
          creationTime={state.addedTime}
          phone={state.phoneNumber}
        />

        {error && <Text>{error.message}</Text>}

        {/* OPEN CHAT SCREEN ON CLICK */}
        <Button
          title="Send a message"
          onPress={() => this.onNavigate(name, cid, chatPath)}
        />
        {/* REMOVE USER */}
        <Button
          title={`Remove ${name}`}
          loading={isButtonLoading}
          onPress={() => this.onRemove(state.key)}
        />
      </Profile>
    );
  }
}

export default withHeader({ title: "Contact Details" })(
  withAuthorization(ContactScreen)
);

ContactScreen.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      key: PropTypes.string.isRequired,
      cid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      addedTime: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string,
      path: PropTypes.string
    })
  })
};
