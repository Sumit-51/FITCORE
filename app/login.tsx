import { View, StyleSheet, Text,ImageBackground } from 'react-native';
import React from 'react';
import Inputfield from '@/components/inputField';

const Login = () => {
  return (
      <ImageBackground 
              source={require('@/assets/images/fitcore.jpg')}
              style={styles.backgroundimage}
              resizeMode='cover'
            >
      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Fitcore
        </Text>
        
      </View>

      {/* Input Fields */}
      <View style={styles.inputsContainer}>
        <View style={{paddingBottom:30,justifyContent:'center'}}>
        <Text style={{color:'#d1dbe6ff',fontSize:40}}>Welcome Back</Text>
        </View>
        <Inputfield />
        <Inputfield />
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  welcomeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'red',
    marginTop:30,
    paddingTop:50,
    paddingBottom:220
  },
  welcomeText: {
    fontSize: 50,
    fontWeight: '800',
    color: '#627182ff',
    textAlign: 'center',
    
  },
  inputsContainer: {
    paddingTop:50,
    width: '100%',
    alignItems: 'center',
    justifyContent:'flex-start',
    gap:15,
    backgroundColor:'blue'
  },
  backgroundimage:{
    flex:1,
    height:'100%',
    width:'100%',
    justifyContent:'flex-start',
    alignItems:'center'
  }
});
