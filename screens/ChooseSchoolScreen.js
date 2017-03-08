import React, { Component, PropTypes } from 'react';
import {
  View,
  StyleSheet,
  ListView,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import colors from '../config/colors';
import { NavigationStyles } from '@expo/ex-navigation';
import SchoolOption from '../components/SchoolOption';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import { email } from 'react-native-communications';

@connectDropdownAlert
export default class ChooseSchoolScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'CHOOSE YOUR SCHOOL',
      tintColor: colors.black,
      titleStyle: {
        fontFamily: 'open-sans-bold',
      },
      backgroundColor: 'white',
    },
    styles: {
      ...NavigationStyles.SlideHorizontal,
    },
  };

  static propTypes = {
    navigator: PropTypes.object,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  };

  state = {
    loading: true,
    schools: [],
  };

  componentWillMount() {
    global.firebaseApp
      .database()
      .ref('schools')
      .once('value')
      .then(snap => {
        const schools = Object.keys(snap.val()).map(schoolUID => {
          return {
            ...snap.val()[schoolUID],
            uid: schoolUID,
          };
        });
        this.setState(() => {
          return { loading: false, schools };
        });
      })
      .catch(err => {
        this.props.alertWithType('error', 'Error', err.toString());
      });
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={this.state.loading}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          </When>
          <Otherwise>
            <ListView
              enableEmptySections
              dataSource={this.ds.cloneWithRows(this.state.schools)}
              renderRow={s => (
                <SchoolOption intent={this.props.intent} school={s} />
              )}
            />
          </Otherwise>
        </Choose>
        <Choose>
          <When condition={this.props.intent === 'signup'}>
            <TouchableOpacity
              onPress={() => {
                email(
                  ['datwheat@gmail.com'],
                  null,
                  null,
                  'PÜL School Request',
                  `Hey!

You should consider adding <SCHOOL NAME> to PÜL!

Our email domain is <EMAIL DOMAIN> (example: '@stpaulsschool.org').

Our hotspots for pickups are:
  1. Name: <NAME>
      Location: (<LAT>, <LON>)
  2. Name: <NAME>
      Location: (<LAT>, <LON>)
  3. Name: <NAME>
      Location: (<LAT>, <LON>)
  4. Name: <NAME>
      Location: (<LAT>, <LON>)

(How to find coordinates: https://support.google.com/maps/answer/18539)

Thanks a lot for considering adding <SCHOOL NAME> to PÜL!

<SENDER NAME>`,
                );
              }}>
              <Text style={styles.notExist}>
                School not listed?
              </Text>

            </TouchableOpacity>
          </When>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  notExist: {
    fontFamily: 'open-sans',
    paddingBottom: 16,
    fontSize: 16,
    alignSelf: 'center',
    color: colors.black,
  },
});