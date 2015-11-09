import React from 'react';
import { LinkedStateMixin } from 'react-catalyst';
import Rebase from 're-base';

import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';

import sampleFishes from '../sample-fishes';

var base = Rebase.createClass('https://catch-react.firebaseio.com/');

export default React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState: function() {
    return {
      fishes: {},
      order: {}
    }
  },
  componentDidMount: function() {
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
  },
  componentWillUpdate: function(nextProps, nextState) {
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
  },
  addToOrder: function(key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({
      order: this.state.order
    });
  },
  removeFromOrder: function(key) {
    delete this.state.order[key];
    this.setState({
      order: this.state.order
    });
  },
  addFish: function(fish) {
    var timestamp = (new Date()).getTime();
    // Update the state object
    this.state.fishes['fish-' + timestamp] = fish;
    // Set the state
    this.setState({
      fishes: this.state.fishes
    });
  },
  removeFish: function(key) {
    if (confirm('Are you sure you want to remove this fish?')) {
      // Remove from the state object
      this.state.fishes[key] = null;
      // Set the state
      this.setState({
        fishes: this.state.fishes
      });
    }
  },
  loadSamples: function() {
    this.setState({
      fishes: sampleFishes
    });
  },
  renderFish: function(key) {
    return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
  },
  render: function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Fish Market" />
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order} removeFromOrder={this.removeFromOrder} />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} linkState={this.linkState} removeFish={this.removeFish} />
      </div>
    )
  }
});
