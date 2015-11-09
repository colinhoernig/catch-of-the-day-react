import React from 'react';
import { LinkedStateMixin } from 'react-catalyst';
import Rebase from 're-base';
import reactMixin from 'react-mixin';
import autobind from 'autobind-decorator';

import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';

import sampleFishes from '../sample-fishes';

var base = Rebase.createClass('https://catch-react.firebaseio.com/');

@autobind
class App extends React.Component {

  constructor() {
    super();
    this.state = {
      fishes: {},
      order: {}
    };
  }

  componentDidMount() {
    base.syncState(this.props.params.storeId + '/fishes', {
      context: this,
      state: 'fishes'
    });

    var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);

    if (localStorageRef) {
      // update component state to reflect what exists in local storage
      this.setState({
        order: JSON.parse(localStorageRef)
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
  }

  addToOrder(key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({
      order: this.state.order
    });
  }

  removeFromOrder(key) {
    delete this.state.order[key];
    this.setState({
      order: this.state.order
    });
  }

  addFish(fish) {
    var timestamp = (new Date()).getTime();
    // Update the state object
    this.state.fishes['fish-' + timestamp] = fish;
    // Set the state
    this.setState({
      fishes: this.state.fishes
    });
  }

  removeFish(key) {
    if (confirm('Are you sure you want to remove this fish?')) {
      // Remove from the state object
      this.state.fishes[key] = null;
      // Set the state
      this.setState({
        fishes: this.state.fishes
      });
    }
  }

  loadSamples() {
    this.setState({
      fishes: sampleFishes
    });
  }

  renderFish(key) {
    return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
  }

  render() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Fish Market" />
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order} removeFromOrder={this.removeFromOrder} />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} linkState={this.linkState.bind(this)} removeFish={this.removeFish} />
      </div>
    )
  }
}

reactMixin.onClass(App, LinkedStateMixin);

export default App;
