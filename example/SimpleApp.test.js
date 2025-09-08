import React from 'react';
import { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

import { SimpleComponent, AnotherComponent } from './SimpleApp';

describe('SimpleComponent', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<SimpleComponent />);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with custom title', () => {
    const wrapper = shallow(<SimpleComponent title="Test Title" />);
    expect(wrapper.find('h1').text()).toBe('Test Title');
  });

  it('displays initial count', () => {
    const wrapper = shallow(<SimpleComponent />);
    expect(wrapper.find('p').text()).toBe('Count: 0');
  });

  it('increments count when button is clicked', () => {
    const wrapper = shallow(<SimpleComponent />);
    const button = wrapper.find('button').at(0); // First button (Increment)
    button.simulate('click');
    expect(wrapper.find('p').text()).toBe('Count: 1');
  });

  it('matches snapshot', () => {
    const wrapper = shallow(<SimpleComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe('AnotherComponent', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<AnotherComponent />);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with custom name', () => {
    const wrapper = shallow(<AnotherComponent name="John" />);
    expect(wrapper.text()).toBe('Hello John');
  });

  it('renders with default name', () => {
    const wrapper = shallow(<AnotherComponent />);
    expect(wrapper.text()).toBe('Hello World');
  });

  it('matches snapshot', () => {
    const wrapper = shallow(<AnotherComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});