import { useEffect, useRef, useState } from 'react'
import { StatusBar, View, ScrollView, TextInput, Animated, Text, TouchableOpacity, Keyboard } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import styled from 'styled-components/native'
import i18n from 'i18n-js'

import Recording from './components/Recording'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import { useRecordingState, getRecordingsAsync } from './RecordingContext'

const Home = () => {
  const [{ recordings, recording }, dispatch] = useRecordingState()
  const [filteredRecs, setFilteredRecs] = useState(recordings)
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const searchInput = useRef(null)
  
  useEffect(() => {
    getRecordings()
  }, [])

  useEffect(() => {
    filterRecordings(searchTerm)
  }, [recordings, searchTerm])

  const getRecordings = async () => {
    const recordings = await getRecordingsAsync()
    dispatch({ type: 'SET_RECORDINGS', payload: recordings })
    setFilteredRecs(recordings)
  }

  const filterRecordings = async text => {
    setFilteredRecs(recordings.filter(rec => {
      const title = rec.title ? rec.title : `${i18n.t('recording.defaultTitle')} ${rec.id}`
      return title.toLowerCase().includes(text.toLowerCase())
    }))
  }

  const clearSearch = () => {
    Keyboard.dismiss()
    setSearchTerm('')
    searchInput.current.blur()
    searchInput.current.clear()
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar 
        translucent 
        backgroundColor="transparent"
        barStyle="light-content"
        />
        <DarkAreaView pointerEvents={recording ? 'none' : 'auto'}>
        <Gradient />
          <ScrollView 
            overScrollMode='never' 
            keyboardShouldPersistTaps='handled'
          >
            <Header />
            <SearchBar 
              contentContainerStyle={{ justifyContent: 'center' }} 
              keyboardShouldPersistTaps='handled'
            >
            <SearchInput
              ref={searchInput}
              onChangeText={setSearchTerm}
              onFocus={() => setSearching(true)}
              onBlur={() => setSearching(false)}
              selectionColor={'#2159ca'}
              spellCheck={false}
              autoCorrect={false}
            />
              <SearchIcon />
              {searching && (
                <SearchCancelButton onPress={clearSearch}>
                  <SearchCancelIcon/>
                </SearchCancelButton>
              )}
            </SearchBar>
            <ScrollView>
              {filteredRecs.map((elem, index) => {
                return (
                  <Recording 
                    data={elem} 
                    key={index}
                    index={index}
                  />
                )
              }).reverse()}
            </ScrollView>
          </ScrollView>
        </DarkAreaView>
        <ControlPanel
        />
    </View>
  )
}

export default Home

const DarkAreaView = styled.SafeAreaView`
  padding-top: 10px;
  background-color: #000;
  height: 85%;
  margin-bottom: 25%;
`

const Gradient = styled(LinearGradient).attrs({
  colors: ['rgb(0,0,0)', 'transparent'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  height: 50px;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 999;
`

const SearchBar = styled.ScrollView`
  position: relative;
  width: 100%;
  padding: 0 15px;
`

const SearchIcon = styled(Ionicons).attrs({
  name: 'md-search',
  size: 20
})`
  position: absolute;
  left: 20px;
  color: #777;
`

const SearchInput = styled.TextInput`
  background-color: #444;
  color: #ddd;
  margin: 10px 10px 10px 10px;
  padding: 0 35px;
  border-radius: 10px;
`

const SearchCancelButton = styled.TouchableOpacity`
  position: absolute;
  right: 20px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`

const SearchCancelIcon = styled(Ionicons).attrs({
  name: 'md-close-circle-outline',
  size: 23
})`
  color: #aaa;
`