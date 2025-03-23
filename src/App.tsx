import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import Chat from './components/Chat'
import './App.css'

const theme = extendTheme({})

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Chat />
    </ChakraProvider>
  )
}

export default App
