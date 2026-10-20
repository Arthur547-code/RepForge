import { Stack } from 'expo-router'

const AppLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
  )
}

export default AppLayout