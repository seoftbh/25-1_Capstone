/**
|--------------------------------------------------
| Board Screen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import { commonStyles } from '@/constants/CommonStyles'
import FeedList from '@/components/FeedList'

export default function BoardScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <FeedList />
    </SafeAreaView>
  )
}