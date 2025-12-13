import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'

interface MyButtonProps {
  title?: string
  onPress: () => void
  style?: ViewStyle
  variant?: 'solid' | 'outline'
}

const Mybutton = ({ 
  title = "Button", 
  onPress, 
  style,
  variant = 'solid'
}: MyButtonProps) => {
  
  const buttonStyle = variant === 'outline' ? styles.outline : styles.solid
  const textStyle = variant === 'outline' ? styles.outlineText : styles.solidText
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.button, buttonStyle, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solid: {
    backgroundColor: '#696a6bff', 
  },
  outline: {
    backgroundColor: 'transparent',  
    borderWidth: 2,                  
    borderColor: 'white',            
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    
  },
  solidText: {
    color: '#a9b1baff'
    
  },
  outlineText: {
    color: 'white',  
  },
})

export default Mybutton