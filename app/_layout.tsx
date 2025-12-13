import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack screenOptions={{headerShown :false}} >
      <Stack.Screen name="index"></Stack.Screen>
      <Stack.Screen name="login"></Stack.Screen>
      <Stack.Screen name="signup"></Stack.Screen>
    </Stack>
  )
}

export default _layout