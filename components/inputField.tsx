import { StyleSheet, TextInput } from 'react-native'
import React from 'react'

const Inputfield = () => {
    
  return (
    
      <TextInput style={styles.inputbutton}></TextInput>
  )
}

export default Inputfield

const styles = StyleSheet.create({
    inputbutton:{
        borderColor:'#0a0a0aff',
        borderRadius:10,
        borderWidth:2,
        textAlign:'left',
        width:'80%',
        height:40,
        padding:15
    }
    }
)