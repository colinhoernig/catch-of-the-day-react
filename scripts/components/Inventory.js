import React from 'react';
import config from '../config';
import AddFishForm from './AddFishForm';
import autobind from 'autobind-decorator';
import Firebase from 'firebase';

const ref = new Firebase(config.firebase_url);

@autobind
class Inventory extends React.Component {

  constructor() {
    super();
    this.state = {
      uid: ''
    };
  }

  componentWillMount() {
    var token = localStorage.getItem('token');
    if (token) {
      ref.authWithCustomToken(token, this.authHandler);
    }
  }

  authenticate(provider) {
    ref.authWithOAuthPopup(provider, this.authHandler);
  }

  logout() {
    ref.unauth();
    localStorage.removeItem('token');
    this.setState({
      uid: null
    });
  }

  authHandler(err, authData) {
    if (err) {
      console.err(err);
      return;
    }

    // save the login token in browser via local storage
    localStorage.setItem('token', authData.token);

    const storeRef = ref.child(this.props.params.storeId);
    storeRef.on('value', snapshot => {
      var data = snapshot.val() || {};

      // If store doesn't have owner
      if (!data.owner) {
        // Make it ours!
        storeRef.set({
          owner: authData.uid
        });
      }

      // update state to reflect the current store owner and user
      this.setState({
        uid: authData.uid,
        owner: data.owner || authData.uid
      });
    })
  }

  renderLogin() {
    return (
      <nav className="renderLogin">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="github" onClick={this.authenticate.bind(this, 'github')}>via @github</button>
      </nav>
    );
  }

  renderInventory(key) {
    var linkState = this.props.linkState;
    return (
      <div className="fish-edit" key={key}>
        <input type="text" valueLink={linkState('fishes.' + key + '.name')} />
        <input type="text" valueLink={linkState('fishes.' + key + '.price')} />
        <select valueLink={linkState('fishes.' + key + '.status')}>
          <option value="unavailable">Sold out!</option>
          <option value="available">Fresh!</option>
        </select>
        <textarea valueLink={linkState('fishes.' + key + '.description')}></textarea>
        <input type="text" valueLink={linkState('fishes.' + key + '.image')} />
        <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
      </div>
    );
  }

  render() {
    let logoutButton = <button className="logout" onClick={this.logout}>Log Out</button>

    if (!this.state.uid) {
      return (
        <div>{this.renderLogin()}</div>
      );
    }

    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Oops! You don't own this store.</p>
          {logoutButton}
        </div>
      )
    }

    return (
      <div>
        <h2>Inventory</h2>

        {logoutButton}

        {Object.keys(this.props.fishes).map(this.renderInventory)}

        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    );
  }

};

Inventory.propTypes = {
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  fishes: React.PropTypes.object.isRequired,
  linkState: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired
};

export default Inventory;
